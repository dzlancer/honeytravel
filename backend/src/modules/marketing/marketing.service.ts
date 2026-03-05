import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { Campaign, CampaignStatus } from './entities/campaign.entity';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(PromoCode)
    private promoRepo: Repository<PromoCode>,
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
  ) {}

  // Promo Codes
  async validatePromoCode(code: string, bookingAmount: number): Promise<{ valid: boolean; discount: number; message: string }> {
    const promo = await this.promoRepo.findOne({ where: { code, isActive: true } });
    if (!promo) return { valid: false, discount: 0, message: 'Invalid promo code' };

    const now = new Date();
    if (now < promo.validFrom || now > promo.validUntil) {
      return { valid: false, discount: 0, message: 'Promo code has expired' };
    }
    if (promo.usedCount >= promo.maxUses) {
      return { valid: false, discount: 0, message: 'Promo code usage limit reached' };
    }
    if (promo.minBookingAmount && bookingAmount < Number(promo.minBookingAmount)) {
      return { valid: false, discount: 0, message: `Minimum booking amount is ${promo.minBookingAmount}` };
    }

    const discount = promo.discountType === 'percentage'
      ? bookingAmount * (Number(promo.discountValue) / 100)
      : Number(promo.discountValue);

    return { valid: true, discount: Math.min(discount, bookingAmount), message: 'Promo code applied' };
  }

  async usePromoCode(code: string): Promise<void> {
    await this.promoRepo.increment({ code }, 'usedCount', 1);
  }

  async createPromoCode(data: Partial<PromoCode>): Promise<PromoCode> {
    const promo = this.promoRepo.create(data);
    return this.promoRepo.save(promo);
  }

  async getPromoCodes(page = 1, limit = 20) {
    return this.promoRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // Campaigns
  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignRepo.create(data);
    return this.campaignRepo.save(campaign);
  }

  async getCampaigns(page = 1, limit = 20) {
    return this.campaignRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    await this.campaignRepo.update(id, data);
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async sendCampaign(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Campaign cannot be sent');
    }
    campaign.status = CampaignStatus.SENT;
    campaign.sentAt = new Date();
    return this.campaignRepo.save(campaign);
  }
}
