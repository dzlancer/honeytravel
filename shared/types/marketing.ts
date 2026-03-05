export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  currency?: string;
  minBookingAmount?: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  bookingId?: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  description: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  targetAudience: 'all' | 'active' | 'inactive' | 'loyal';
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  openRate?: number;
  clickRate?: number;
  createdAt: string;
}

export interface Recommendation {
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
