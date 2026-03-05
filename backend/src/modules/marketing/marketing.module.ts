import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PromoCode } from './entities/promo-code.entity';
import { Campaign } from './entities/campaign.entity';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { RecommendationService } from './recommendation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode, Campaign]),
    BullModule.registerQueue({ name: 'marketing' }),
  ],
  controllers: [MarketingController],
  providers: [MarketingService, RecommendationService],
  exports: [MarketingService, RecommendationService],
})
export class MarketingModule {}
