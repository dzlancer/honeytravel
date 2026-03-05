import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierAdapter } from './interfaces/supplier-adapter.interface';
import { Supplier } from './entities/supplier.entity';
import { MockHotelAdapter } from './adapters/mock-hotel.adapter';
import { decrypt } from '../../config/encryption.util';

@Injectable()
export class SupplierRegistryService implements OnModuleInit {
  private readonly logger = new Logger(SupplierRegistryService.name);
  private adapters = new Map<string, SupplierAdapter>();
  private adapterFactories = new Map<string, () => SupplierAdapter>();

  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {
    // Register known adapter factories
    this.adapterFactories.set('mock-hotels', () => new MockHotelAdapter());
  }

  async onModuleInit() {
    await this.loadAdapters();
  }

  private async loadAdapters() {
    // Always register the mock adapter for development/demo
    const mockAdapter = new MockHotelAdapter();
    mockAdapter.initialize({});
    this.adapters.set('mock-hotel', mockAdapter);
    this.logger.log('Loaded built-in mock-hotel adapter');

    // Load additional adapters from database
    try {
      const suppliers = await this.supplierRepo.find({ where: { isActive: true } });
      for (const supplier of suppliers) {
        try {
          const factory = this.adapterFactories.get(supplier.code);
          if (!factory) {
            this.logger.warn(`No adapter factory for supplier: ${supplier.code}`);
            continue;
          }
          const adapter = factory();
          const credentials = JSON.parse(decrypt(supplier.encryptedCredentials));
          adapter.initialize(credentials, supplier.config as Record<string, unknown> | undefined);
          this.adapters.set(supplier.code, adapter);
          this.logger.log(`Loaded adapter: ${supplier.code}`);
        } catch (error) {
          this.logger.error(`Failed to load adapter for ${supplier.code}: ${error}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Could not load suppliers from database: ${error}`);
    }
  }

  getAdapter(supplierId: string): SupplierAdapter | undefined {
    return this.adapters.get(supplierId);
  }

  getAllAdapters(): SupplierAdapter[] {
    return Array.from(this.adapters.values());
  }

  registerFactory(code: string, factory: () => SupplierAdapter): void {
    this.adapterFactories.set(code, factory);
  }
}
