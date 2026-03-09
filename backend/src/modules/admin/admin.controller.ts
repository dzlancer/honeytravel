import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { BookingsService } from '../bookings/bookings.service';
import { MarketingService } from '../marketing/marketing.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { SupplierRegistryService } from '../suppliers/supplier-registry.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

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
    private suppliersService: SuppliersService,
    private supplierRegistry: SupplierRegistryService,
    private systemConfigService: SystemConfigService,
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
    return this.usersService.findAll(page || 1, limit || 20);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings' })
  async listBookings(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.bookingsService.findAll(page || 1, limit || 20);
  }

  // Promo codes
  @Post('promos')
  @ApiOperation({ summary: 'Create a promo code' })
  async createPromo(@Body() body: {
    code: string; discountType: 'percentage' | 'fixed'; discountValue: number;
    maxUses: number; validFrom: string; validUntil: string;
    minBookingAmount?: number; currency?: string;
  }) {
    const { validFrom, validUntil, ...rest } = body;
    return this.marketingService.createPromoCode({
      ...rest,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
    });
  }

  @Get('promos')
  @ApiOperation({ summary: 'List promo codes' })
  async listPromos(@Query('page') page?: number, @Query('limit') limit?: number) {
    const [promos, total] = await this.marketingService.getPromoCodes(page || 1, limit || 20);
    return { promos, total };
  }

  // Campaigns
  @Post('campaigns')
  @ApiOperation({ summary: 'Create an email campaign' })
  async createCampaign(@Body() body: {
    name: string; subject: string; body: string;
    targetAudience: string; scheduledAt?: string;
  }) {
    const { scheduledAt, ...rest } = body;
    return this.marketingService.createCampaign({
      ...rest,
      ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
    });
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List campaigns' })
  async listCampaigns(@Query('page') page?: number, @Query('limit') limit?: number) {
    const [campaigns, total] = await this.marketingService.getCampaigns(page || 1, limit || 20);
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

  // ─── Supplier Management ─────────────────────────────────

  @Get('suppliers')
  @ApiOperation({ summary: 'List all suppliers with config' })
  async listSuppliers() {
    return this.suppliersService.findAllSuppliers();
  }

  @Put('suppliers/:id')
  @ApiOperation({ summary: 'Update a supplier configuration' })
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @Request() req: any,
  ) {
    // Get old state for audit
    const oldSupplier = await this.suppliersService.findSupplierById(id);
    const oldSnapshot = {
      isActive: oldSupplier.isActive,
      baseUrl: oldSupplier.baseUrl,
      markupPercentage: oldSupplier.markupPercentage,
      priority: oldSupplier.priority,
      isMock: oldSupplier.isMock,
      rateLimit: oldSupplier.rateLimit,
      timeout: oldSupplier.timeout,
    };

    // Apply update
    const updated = await this.suppliersService.updateSupplier(id, dto);

    // Audit log
    await this.systemConfigService.createAuditLog({
      entityType: 'supplier',
      entityId: id,
      action: 'update',
      oldValue: JSON.stringify(oldSnapshot),
      newValue: JSON.stringify({
        isActive: updated.isActive,
        baseUrl: updated.baseUrl,
        markupPercentage: updated.markupPercentage,
        priority: updated.priority,
        isMock: updated.isMock,
        rateLimit: updated.rateLimit,
        timeout: updated.timeout,
      }),
      userId: req.user.sub,
      userEmail: req.user.email,
    });

    // Runtime reload
    await this.supplierRegistry.reloadAdapter(id);

    return updated;
  }

  @Post('suppliers/:id/test')
  @ApiOperation({ summary: 'Test a supplier connection' })
  async testSupplierConnection(@Param('id') id: string) {
    return this.suppliersService.testSupplierConnection(id);
  }
}
