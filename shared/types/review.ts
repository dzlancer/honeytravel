export interface Review {
  id: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string };
  productType: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewDto {
  productType: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}
