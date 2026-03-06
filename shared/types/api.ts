export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    loyaltyPoints: number;
    preferredCurrency: string;
    preferredLanguage: string;
  };
}

export interface MessageResponse {
  message: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activePromos: number;
  recentBookings: number;
  bookingsByStatus: Record<string, number>;
}

export interface LoyaltyBalance {
  points: number;
  tier: string;
}

export interface PromoValidationResult {
  valid: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
  message?: string;
}
