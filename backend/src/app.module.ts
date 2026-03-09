import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HealthModule } from './modules/health/health.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get('DB_TYPE', 'postgres');
        if (dbType === 'sqlite') {
          return {
            type: 'better-sqlite3' as any,
            database: path.join(__dirname, '..', 'dev.sqlite'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get('DB_USERNAME', 'tsa_user'),
          password: config.get('DB_PASSWORD', 'tsa_password'),
          database: config.get('DB_DATABASE', 'travel_shop_algeria'),
          autoLoadEntities: true,
          synchronize: config.get('NODE_ENV') === 'development',
          logging: config.get('NODE_ENV') === 'development',
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
          },
        };
      },
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          lazyConnect: true,
          retryStrategy: (times: number) => {
            if (times > 3) return null;          // stop retrying
            return Math.min(times * 500, 3000);
          },
          reconnectOnError: () => false,
        },
      }),
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    AuthModule,
    UsersModule,
    SuppliersModule,
    BookingsModule,
    PaymentsModule,
    SearchModule,
    NotificationsModule,
    MarketingModule,
    LoyaltyModule,
    AdminModule,
    ReviewsModule,
    FavoritesModule,
    HealthModule,
    SystemConfigModule,
  ],
})
export class AppModule {}
