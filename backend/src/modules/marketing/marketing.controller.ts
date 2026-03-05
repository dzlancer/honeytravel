import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MarketingService } from './marketing.service';
import { RecommendationService } from './recommendation.service';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private marketingService: MarketingService,
    private recommendationService: RecommendationService,
  ) {}

  @Public()
  @Post('promo/validate')
  @ApiOperation({ summary: 'Validate a promo code' })
  async validatePromo(@Body() body: { code: string; amount: number }) {
    return this.marketingService.validatePromoCode(body.code, body.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalised recommendations' })
  async getRecommendations(@CurrentUser('id') userId: string) {
    return this.recommendationService.getRecommendations(userId);
  }
}
