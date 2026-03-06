import type {
  User,
  Booking, CreateBookingDto,
  Hotel, Flight, Activity, CarRental,
  PaymentResult,
  Review, ReviewsResponse, CreateReviewDto,
  Notification as TsaNotification, NotificationsResponse,
  Favorite,
  PromoCode, Campaign, LoyaltyTransaction, Recommendation,
} from '@shared/types';
import type {
  AuthResponse, MessageResponse, AdminDashboardStats, LoyaltyBalance, PromoValidationResult, PaginatedResponse,
} from '@shared/types/api';

// Use relative URLs in the browser (goes through Next.js rewrite proxy, avoids CORS)
// Use absolute URL only on the server side (SSR)
const API_URL =
  typeof window !== 'undefined'
    ? ''
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('accessToken', token);
      else localStorage.removeItem('accessToken');
    }
  }

  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && token) {
      // Try refresh
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            this.setToken(data.accessToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            headers['Authorization'] = `Bearer ${data.accessToken}`;
            const retryRes = await fetch(`${API_URL}/api${path}`, { ...options, headers });
            if (!retryRes.ok) throw new Error(await retryRes.text());
            return retryRes.json();
          }
        } catch {
          this.setToken(null);
        }
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  forgotPassword(email: string) {
    return this.request<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  resetPassword(token: string, password: string) {
    return this.request<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  logout() {
    return this.request<void>('/auth/logout', { method: 'POST' }).finally(() => {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
    });
  }

  // User
  getProfile() {
    return this.request<User>('/users/me');
  }

  updateProfile(data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'preferredCurrency' | 'preferredLanguage'>>) {
    return this.request<User>('/users/me', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Search — Hotels
  searchHotels(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ results: Hotel[]; total: number }>(`/suppliers/hotels/search?${qs}`);
  }

  getHotel(id: string) {
    return this.request<Hotel>(`/suppliers/hotels/${id}`);
  }

  searchES(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ results: Hotel[]; total: number }>(`/search/hotels?${qs}`);
  }

  // Bookings
  createBooking(data: CreateBookingDto) {
    return this.request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) });
  }

  getMyBookings(page = 1) {
    return this.request<{ bookings: Booking[]; total: number; page: number; limit: number }>(`/bookings/my?page=${page}`);
  }

  getBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}`);
  }

  cancelBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/cancel`, { method: 'PUT' });
  }

  // Payments
  createPaymentIntent(data: { bookingId: string; amount: number; currency: string }) {
    return this.request<PaymentResult>('/payments/create-intent', { method: 'POST', body: JSON.stringify(data) });
  }

  // Loyalty
  getLoyaltyBalance() {
    return this.request<LoyaltyBalance>('/loyalty/balance');
  }

  getLoyaltyHistory(page = 1) {
    return this.request<PaginatedResponse<LoyaltyTransaction>>(`/loyalty/history?page=${page}`);
  }

  // Marketing
  validatePromo(code: string, amount: number) {
    return this.request<PromoValidationResult>('/marketing/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    });
  }

  getRecommendations() {
    return this.request<Recommendation[]>('/marketing/recommendations');
  }

  // Flights
  searchFlights(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ results: Flight[]; total: number }>(`/suppliers/flights/search?${qs}`);
  }

  getFlight(id: string) {
    return this.request<Flight>(`/suppliers/flights/${id}`);
  }

  // Activities
  searchActivities(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ results: Activity[]; total: number }>(`/suppliers/activities/search?${qs}`);
  }

  getActivity(id: string) {
    return this.request<Activity>(`/suppliers/activities/${id}`);
  }

  // Cars
  searchCars(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ results: CarRental[]; total: number }>(`/suppliers/cars/search?${qs}`);
  }

  getCar(id: string) {
    return this.request<CarRental>(`/suppliers/cars/${id}`);
  }

  // Reviews
  getProductReviews(productType: string, productId: string, page = 1, limit = 10) {
    return this.request<ReviewsResponse>(`/reviews/product/${productType}/${productId}?page=${page}&limit=${limit}`);
  }

  createReview(data: CreateReviewDto) {
    return this.request<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });
  }

  markReviewHelpful(reviewId: string) {
    return this.request<Review>(`/reviews/${reviewId}/helpful`, { method: 'PATCH' });
  }

  getMyReviews(page = 1) {
    return this.request<PaginatedResponse<Review>>(`/reviews/my?page=${page}`);
  }

  // Favorites
  getFavorites(type?: string) {
    const qs = type ? `?type=${type}` : '';
    return this.request<Favorite[]>(`/favorites${qs}`);
  }

  addFavorite(productType: string, productId: string) {
    return this.request<Favorite>('/favorites', { method: 'POST', body: JSON.stringify({ productType, productId }) });
  }

  removeFavorite(productType: string, productId: string) {
    return this.request<void>(`/favorites/${productType}/${productId}`, { method: 'DELETE' });
  }

  checkFavorite(productType: string, productId: string) {
    return this.request<{ isFavorited: boolean }>(`/favorites/check/${productType}/${productId}`);
  }

  // Notifications
  getNotifications(page = 1) {
    return this.request<NotificationsResponse>(`/notifications?page=${page}`);
  }

  getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  markNotificationRead(id: string) {
    return this.request<TsaNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  markAllNotificationsRead() {
    return this.request<MessageResponse>('/notifications/read-all', { method: 'PATCH' });
  }

  // Admin
  getAdminStats() {
    return this.request<AdminDashboardStats>('/admin/dashboard');
  }

  getAdminUsers() {
    return this.request<User[]>('/admin/users');
  }

  getAdminBookings(limit = 20) {
    return this.request<{ bookings: Booking[]; total: number }>(`/admin/bookings?limit=${limit}`);
  }

  getAdminPromos() {
    return this.request<PromoCode[]>('/admin/promos');
  }

  createAdminPromo(data: Partial<PromoCode>) {
    return this.request<PromoCode>('/admin/promos', { method: 'POST', body: JSON.stringify(data) });
  }

  getAdminCampaigns() {
    return this.request<Campaign[]>('/admin/campaigns');
  }

  createAdminCampaign(data: Partial<Campaign>) {
    return this.request<Campaign>('/admin/campaigns', { method: 'POST', body: JSON.stringify(data) });
  }

  sendCampaign(id: string) {
    return this.request<Campaign>(`/admin/campaigns/${id}/send`, { method: 'PUT' });
  }
}

export const api = new ApiClient();

// SWR fetcher
export const fetcher = (url: string) =>
  fetch(`${API_URL}/api${url}`, {
    headers: {
      Authorization: `Bearer ${api.getToken()}`,
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json());
