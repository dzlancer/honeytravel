import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyTransaction, LoyaltyTransactionType } from './entities/loyalty-transaction.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyTransaction)
    private loyaltyRepo: Repository<LoyaltyTransaction>,
    private usersService: UsersService,
  ) {}

  async awardPoints(userId: string, points: number, bookingId: string, description: string) {
    const transaction = this.loyaltyRepo.create({
      userId,
      bookingId,
      points,
      type: LoyaltyTransactionType.EARNED,
      description,
    });
    await this.loyaltyRepo.save(transaction);
    await this.usersService.updateLoyaltyPoints(userId, points);
    return transaction;
  }

  async deductPoints(userId: string, points: number, bookingId: string, description: string) {
    const user = await this.usersService.findById(userId);
    if (!user || user.loyaltyPoints < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    const transaction = this.loyaltyRepo.create({
      userId,
      bookingId,
      points: -points,
      type: LoyaltyTransactionType.REDEEMED,
      description,
    });
    await this.loyaltyRepo.save(transaction);
    await this.usersService.updateLoyaltyPoints(userId, -points);
    return transaction;
  }

  async redeemPoints(userId: string, points: number, description: string) {
    return this.deductPoints(userId, points, '', description);
  }

  async addBonus(userId: string, points: number, description: string) {
    const transaction = this.loyaltyRepo.create({
      userId,
      points,
      type: LoyaltyTransactionType.BONUS,
      description,
    });
    await this.loyaltyRepo.save(transaction);
    await this.usersService.updateLoyaltyPoints(userId, points);
    return transaction;
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const [transactions, total] = await this.loyaltyRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { transactions, total, page, limit };
  }

  async getBalance(userId: string): Promise<number> {
    const user = await this.usersService.findById(userId);
    return user?.loyaltyPoints || 0;
  }
}
