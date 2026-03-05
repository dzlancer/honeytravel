import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3001/api';

class MobileApiClient {
  private accessToken: string | null = null;

  async init() {
    this.accessToken = await AsyncStorage.getItem('accessToken');
  }

  async setTokens(access: string, refresh: string) {
    this.accessToken = access;
    await AsyncStorage.setItem('accessToken', access);
    await AsyncStorage.setItem('refreshToken', refresh);
  }

  async clearTokens() {
    this.accessToken = null;
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...headers ? { ...options, headers } : options });

    if (res.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            await this.setTokens(data.accessToken, data.refreshToken);
            headers['Authorization'] = `Bearer ${data.accessToken}`;
            const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers });
            return retryRes.json();
          }
        } catch {
          await this.clearTokens();
        }
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message);
    }
    return res.json();
  }

  login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getProfile() { return this.request<any>('/users/me'); }

  searchHotels(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any>(`/suppliers/hotels/search?${qs}`);
  }

  getHotel(id: string) { return this.request<any>(`/suppliers/hotels/${id}`); }

  createBooking(data: any) {
    return this.request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) });
  }

  getMyBookings() { return this.request<any>('/bookings/my'); }

  cancelBooking(id: string) {
    return this.request<any>(`/bookings/${id}/cancel`, { method: 'PUT' });
  }

  getLoyaltyBalance() { return this.request<any>('/loyalty/balance'); }

  getRecommendations() { return this.request<any>('/marketing/recommendations'); }
}

export const mobileApi = new MobileApiClient();
