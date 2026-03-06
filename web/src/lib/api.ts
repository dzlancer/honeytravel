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
    return this.request<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    return this.request('/auth/logout', { method: 'POST' }).finally(() => {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
    });
  }

  // User
  getProfile() {
    return this.request<any>('/users/me');
  }

  updateProfile(data: any) {
    return this.request<any>('/users/me', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Search
  searchHotels(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/suppliers/hotels/search?${qs}`);
  }

  getHotel(id: string) {
    return this.request<any>(`/suppliers/hotels/${id}`);
  }

  searchES(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/search/hotels?${qs}`);
  }

  // Bookings
  createBooking(data: any) {
    return this.request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) });
  }

  getMyBookings(page = 1) {
    return this.request<any>(`/bookings/my?page=${page}`);
  }

  getBooking(id: string) {
    return this.request<any>(`/bookings/${id}`);
  }

  cancelBooking(id: string) {
    return this.request<any>(`/bookings/${id}/cancel`, { method: 'PUT' });
  }

  // Payments
  createPaymentIntent(data: { bookingId: string; amount: number; currency: string }) {
    return this.request<any>('/payments/create-intent', { method: 'POST', body: JSON.stringify(data) });
  }

  // Loyalty
  getLoyaltyBalance() {
    return this.request<any>('/loyalty/balance');
  }

  getLoyaltyHistory(page = 1) {
    return this.request<any>(`/loyalty/history?page=${page}`);
  }

  // Marketing
  validatePromo(code: string, amount: number) {
    return this.request<any>('/marketing/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    });
  }

  getRecommendations() {
    return this.request<any>('/marketing/recommendations');
  }

  // Flights
  searchFlights(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/suppliers/flights/search?${qs}`);
  }

  getFlight(id: string) {
    return this.request<any>(`/suppliers/flights/${id}`);
  }

  // Activities
  searchActivities(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/suppliers/activities/search?${qs}`);
  }

  getActivity(id: string) {
    return this.request<any>(`/suppliers/activities/${id}`);
  }

  // Cars
  searchCars(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/suppliers/cars/search?${qs}`);
  }

  getCar(id: string) {
    return this.request<any>(`/suppliers/cars/${id}`);
  }

  // Reviews
  getProductReviews(productType: string, productId: string, page = 1, limit = 10) {
    return this.request<any>(`/reviews/product/${productType}/${productId}?page=${page}&limit=${limit}`);
  }

  createReview(data: { productType: string; productId: string; rating: number; title: string; comment: string; images?: string[] }) {
    return this.request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) });
  }

  markReviewHelpful(reviewId: string) {
    return this.request<any>(`/reviews/${reviewId}/helpful`, { method: 'PATCH' });
  }

  getMyReviews(page = 1) {
    return this.request<any>(`/reviews/my?page=${page}`);
  }

  // Favorites
  getFavorites(type?: string) {
    const qs = type ? `?type=${type}` : '';
    return this.request<any>(`/favorites${qs}`);
  }

  addFavorite(productType: string, productId: string) {
    return this.request<any>('/favorites', { method: 'POST', body: JSON.stringify({ productType, productId }) });
  }

  removeFavorite(productType: string, productId: string) {
    return this.request<any>(`/favorites/${productType}/${productId}`, { method: 'DELETE' });
  }

  checkFavorite(productType: string, productId: string) {
    return this.request<any>(`/favorites/check/${productType}/${productId}`);
  }

  // Notifications
  getNotifications(page = 1) {
    return this.request<any>(`/notifications?page=${page}`);
  }

  getUnreadCount() {
    return this.request<any>('/notifications/unread-count');
  }

  markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  markAllNotificationsRead() {
    return this.request<any>('/notifications/read-all', { method: 'PATCH' });
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
