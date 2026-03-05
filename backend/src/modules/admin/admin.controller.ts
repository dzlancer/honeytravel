import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { BookingsService } from '../bookings/bookings.service';
import { MarketingService } from '../marketing/marketing.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private bookingsService: BookingsService,
    private marketingService: MarketingService,
    private loyaltyService: LoyaltyService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboard() {
    const { total: totalUsers } = await this.usersService.findAll(1, 1);
    const { total: totalBookings } = await this.bookingsService.findAll(1, 1);
    return {
      totalUsers,
      totalBookings,
      revenue: 0, // calculated from payments in production
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page, limit);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings' })
  async listBookings(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.bookingsService.findAll(page, limit);
  }

  // Promo codes
  @Post('promos')
  @ApiOperation({ summary: 'Create a promo code' })
  async createPromo(@Body() body: {
    code: string; discountType: 'percentage' | 'fixed'; discountValue: number;
    maxUses: number; validFrom: string; validUntil: string;
    minBookingAmount?: number; currency?: string;
  }) {
    return this.marketingService.createPromoCode(body);
  }

  @Get('promos')
  @ApiOperation({ summary: 'List promo codes' })
  async listPromos(@Query('page') page?: number, @Query('limit') limit?: number) {
    const [promos, total] = await this.marketingService.getPromoCodes(page, limit);
    return { promos, total };
  }

  // Campaigns
  @Post('campaigns')
  @ApiOperation({ summary: 'Create an email campaign' })
  async createCampaign(@Body() body: {
    name: string; subject: string; body: string;
    targetAudience: string; scheduledAt?: string;
  }) {
    return this.marketingService.createCampaign(body);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List campaigns' })
  async listCampaigns(@Query('page') page?: number, @Query('limit') limit?: number) {
    const [campaigns, total] = await this.marketingService.getCampaigns(page, limit);
    return { campaigns, total };
  }

  @Put('campaigns/:id/send')
  @ApiOperation({ summary: 'Send a campaign' })
  async sendCampaign(@Param('id') id: string) {
    return this.marketingService.sendCampaign(id);
  }

  // Loyalty bonuses
  @Post('loyalty/bonus')
  @ApiOperation({ summary: 'Award bonus loyalty points to a user' })
  async awardBonus(@Body() body: { userId: string; points: number; description: string }) {
    return this.loyaltyService.addBonus(body.userId, body.points, body.description);
  }
}
