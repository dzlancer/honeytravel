import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { MarketingModule } from '../marketing/marketing.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    UsersModule,
    BookingsModule,
    MarketingModule,
    LoyaltyModule,
    SuppliersModule,
    SystemConfigModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
