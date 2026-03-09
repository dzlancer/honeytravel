import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SystemConfig } from './system-config.entity';
import { ConfigAuditLog } from './config-audit-log.entity';

interface ConfigSeed {
  key: string;
  value: string;
  type: string;
  category: string;
  label: string;
  description?: string;
}

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private readonly logger = new Logger(SystemConfigService.name);
  private cache = new Map<string, string>();

  constructor(
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
    @InjectRepository(ConfigAuditLog)
    private auditRepo: Repository<ConfigAuditLog>,
    private envConfig: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
    await this.refreshCache();
    this.logger.log(`SystemConfig loaded ${this.cache.size} entries into cache`);
  }

  // ─── Cache ───────────────────────────────────────────────

  private async refreshCache() {
    const all = await this.configRepo.find();
    this.cache.clear();
    for (const c of all) {
      this.cache.set(c.key, c.value);
    }
  }

  // ─── Typed Getters (cache → .env → default) ─────────────

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  getBoolean(key: string, fallbackEnvKey?: string, defaultValue = false): boolean {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached === 'true';
    }
    if (fallbackEnvKey) {
      const envVal = this.envConfig.get<string>(fallbackEnvKey);
      if (envVal !== undefined) return envVal === 'true';
    }
    return defaultValue;
  }

  getString(key: string, fallbackEnvKey?: string, defaultValue = ''): string {
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    if (fallbackEnvKey) {
      const envVal = this.envConfig.get<string>(fallbackEnvKey);
      if (envVal !== undefined) return envVal;
    }
    return defaultValue;
  }

  getNumber(key: string, fallbackEnvKey?: string, defaultValue = 0): number {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      const n = Number(cached);
      return isNaN(n) ? defaultValue : n;
    }
    if (fallbackEnvKey) {
      const envVal = this.envConfig.get<number>(fallbackEnvKey);
      if (envVal !== undefined) return envVal;
    }
    return defaultValue;
  }

  getJson<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      try { return JSON.parse(cached); } catch { return defaultValue; }
    }
    return defaultValue;
  }

  // ─── CRUD ────────────────────────────────────────────────

  async getAll(category?: string): Promise<SystemConfig[]> {
    if (category) {
      return this.configRepo.find({ where: { category }, order: { key: 'ASC' } });
    }
    return this.configRepo.find({ order: { category: 'ASC', key: 'ASC' } });
  }

  async set(
    key: string,
    value: string,
    userId: string,
    userEmail: string,
  ): Promise<SystemConfig> {
    const existing = await this.configRepo.findOne({ where: { key } });
    if (!existing) {
      throw new Error(`Config key "${key}" not found`);
    }

    const oldValue = existing.value;
    existing.value = value;
    existing.updatedBy = userId;
    const saved = await this.configRepo.save(existing);

    // Update cache immediately
    this.cache.set(key, value);

    // Audit log
    await this.createAuditLog({
      entityType: 'system_config',
      entityId: key,
      action: 'update',
      oldValue: JSON.stringify({ value: oldValue }),
      newValue: JSON.stringify({ value }),
      userId,
      userEmail,
    });

    this.logger.log(`Config "${key}" updated by ${userEmail}: ${oldValue} → ${value}`);
    return saved;
  }

  // ─── Audit Log ───────────────────────────────────────────

  async createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    userId: string;
    userEmail: string;
  }): Promise<ConfigAuditLog> {
    const log = this.auditRepo.create(data);
    return this.auditRepo.save(log);
  }

  async getAuditLogs(
    page = 1,
    limit = 20,
    entityType?: string,
  ): Promise<{ items: ConfigAuditLog[]; total: number }> {
    const qb = this.auditRepo.createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (entityType) {
      qb.where('log.entityType = :entityType', { entityType });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  // ─── Seed Defaults ──────────────────────────────────────

  private async seedDefaults() {
    const defaults: ConfigSeed[] = [
      {
        key: 'feature.hotels.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Hotels',
        description: 'Enable/disable hotel search and booking',
      },
      {
        key: 'feature.flights.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Flights',
        description: 'Enable/disable flight search and booking',
      },
      {
        key: 'feature.activities.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Activities',
        description: 'Enable/disable activity search and booking',
      },
      {
        key: 'feature.cars.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Car Rentals',
        description: 'Enable/disable car rental search and booking',
      },
      {
        key: 'feature.tours.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Tours',
        description: 'Enable/disable tour search and booking',
      },
      {
        key: 'feature.payments.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Payments',
        description: 'Enable/disable payment processing',
      },
      {
        key: 'feature.promos.enabled',
        value: 'true',
        type: 'boolean',
        category: 'feature_flags',
        label: 'Promo Codes',
        description: 'Enable/disable promotional code system',
      },
      {
        key: 'global.maintenanceMode',
        value: 'false',
        type: 'boolean',
        category: 'global',
        label: 'Maintenance Mode',
        description: 'Put the platform in maintenance mode',
      },
      {
        key: 'global.currencies',
        value: '["USD","EUR","DZD","GBP"]',
        type: 'json',
        category: 'currency',
        label: 'Supported Currencies',
        description: 'List of currencies available on the platform',
      },
      {
        key: 'global.bookingFee',
        value: '0',
        type: 'number',
        category: 'global',
        label: 'Booking Fee',
        description: 'Global booking fee added to all orders (in cents)',
      },
    ];

    for (const seed of defaults) {
      const exists = await this.configRepo.findOne({ where: { key: seed.key } });
      if (!exists) {
        await this.configRepo.save(this.configRepo.create(seed));
        this.logger.log(`Seeded config: ${seed.key} = ${seed.value}`);
      }
    }
  }
}
