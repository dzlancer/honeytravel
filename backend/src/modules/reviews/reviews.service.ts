import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus, ProductType } from '../bookings/entities/booking.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    private bookingsService: BookingsService,
  ) {}

  async create(userId: string, dto: {
    productType: ProductType;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<Review> {
    // Check if user has a completed/confirmed booking for this product
    let isVerified = false;
    try {
      const { bookings } = await this.bookingsService.findByUserId(userId, 1, 100);
      isVerified = bookings.some(
        (b) => b.productType === dto.productType &&
               b.productId === dto.productId &&
               (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED),
      );
    } catch {
      // If booking check fails, proceed without verified badge
    }

    const review = this.reviewRepo.create({
      ...dto,
      userId,
      isVerified,
    });
    return this.reviewRepo.save(review);
  }

  async findByProduct(productType: string, productId: string, page = 1, limit = 10) {
    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { productType: productType as ProductType, productId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    // Calculate aggregate stats
    const allRatings = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.productType = :productType AND review.productId = :productId', { productType, productId })
      .groupBy('review.rating')
      .getRawMany();

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    allRatings.forEach((r) => {
      const rating = Number(r.rating);
      const count = Number(r.count);
      ratingDistribution[rating] = count;
      totalRating += rating * count;
    });

    const averageRating = total > 0 ? Math.round((totalRating / total) * 10) / 10 : 0;

    // Strip password hashes from user data
    const safeReviews = reviews.map((r) => ({
      ...r,
      user: r.user ? { id: r.user.id, firstName: r.user.firstName, lastName: r.user.lastName } : null,
    }));

    return {
      reviews: safeReviews,
      total,
      page,
      limit,
      averageRating,
      ratingDistribution,
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { reviews, total, page, limit };
  }

  async markHelpful(reviewId: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    review.helpfulCount += 1;
    return this.reviewRepo.save(review);
  }

  async delete(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Not your review');
    await this.reviewRepo.remove(review);
  }
}
