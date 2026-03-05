import { Injectable, Logger } from '@nestjs/common';

export interface RecommendationItem {
  productId: string;
  productType: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  score: number;
  reason: string;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  /**
   * Simple recommendation engine based on:
   * 1. User's search history (recent destinations)
   * 2. Past bookings (similar hotels/locations)
   * 3. Popular items (global trending)
   *
   * In production, this would use collaborative filtering or an ML model.
   */
  async getRecommendations(
    userId: string,
    _searchHistory: string[] = [],
    _pastBookings: string[] = [],
    limit = 6,
  ): Promise<RecommendationItem[]> {
    // Mock recommendations — in production, query ES/DB with user preferences
    const recommendations: RecommendationItem[] = [
      {
        productId: 'MH001',
        productType: 'hotel',
        name: 'Grand Hotel Algiers',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        price: 250,
        currency: 'USD',
        rating: 4.7,
        score: 0.95,
        reason: 'Popular in your recent searches',
      },
      {
        productId: 'MH002',
        productType: 'hotel',
        name: 'Sahara Oasis Resort',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        price: 120,
        currency: 'USD',
        rating: 4.3,
        score: 0.88,
        reason: 'Similar to hotels you liked',
      },
      {
        productId: 'MH003',
        productType: 'hotel',
        name: 'Constantine Cliff Hotel',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        price: 150,
        currency: 'USD',
        rating: 4.5,
        score: 0.82,
        reason: 'Trending destination',
      },
    ];

    return recommendations.slice(0, limit);
  }
}
