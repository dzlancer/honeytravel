import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoyaltyService } from './loyalty.service';

@ApiTags('loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get loyalty points balance' })
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.loyaltyService.getBalance(userId);
    return { balance, valueUsd: balance * 0.01 }; // 1 point = $0.01
  }

  @Get('history')
  @ApiOperation({ summary: 'Get loyalty points history' })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.loyaltyService.getHistory(userId, page, limit);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem loyalty points' })
  async redeem(
    @CurrentUser('id') userId: string,
    @Body() body: { points: number },
  ) {
    return this.loyaltyService.redeemPoints(userId, body.points, 'Points redeemed at checkout');
  }
}
