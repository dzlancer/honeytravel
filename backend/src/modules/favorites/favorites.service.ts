import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { ProductType } from '../bookings/entities/booking.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
  ) {}

  async add(userId: string, productType: ProductType, productId: string): Promise<Favorite> {
    const existing = await this.favoriteRepo.findOne({
      where: { userId, productType, productId },
    });
    if (existing) return existing;

    const favorite = this.favoriteRepo.create({ userId, productType, productId });
    return this.favoriteRepo.save(favorite);
  }

  async remove(userId: string, productType: string, productId: string): Promise<void> {
    await this.favoriteRepo.delete({
      userId,
      productType: productType as ProductType,
      productId,
    });
  }

  async findByUser(userId: string, type?: string) {
    const where: any = { userId };
    if (type) where.productType = type;
    return this.favoriteRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorited(userId: string, productType: string, productId: string): Promise<boolean> {
    const count = await this.favoriteRepo.count({
      where: { userId, productType: productType as ProductType, productId },
    });
    return count > 0;
  }
}
