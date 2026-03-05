import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { MarketingModule } from '../marketing/marketing.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [UsersModule, BookingsModule, MarketingModule, LoyaltyModule],
  controllers: [AdminController],
})
export class AdminModule {}
