const API_URL = import.meta.env.VITE_API_URL || "";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Hotels
  getHotels: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return fetchAPI<{ hotels: any[]; total: number; page: number; pages: number }>(`/api/hotels${qs}`);
  },

  getHotel: (slug: string, channel?: string) => {
    const qs = channel ? `?channel=${channel}` : "";
    return fetchAPI<any>(`/api/hotels/${slug}${qs}`);
  },

  getDistricts: () =>
    fetchAPI<{ districts: { name: string; count: number }[] }>("/api/hotels/districts"),

  getSocialProof: () =>
    fetchAPI<{ bookings_today: number; recent_bookings: any[] }>("/api/hotels/social-proof"),

  getMapData: () =>
    fetchAPI<{ hotels: any[] }>("/api/hotels/map-data"),

  getAvailability: (slug: string, params?: Record<string, string | number | boolean>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return fetchAPI<any>(`/api/hotels/${slug}/availability${qs}`);
  },

  // Bookings
  createBooking: (data: any) =>
    fetchAPI<any>("/api/bookings", { method: "POST", body: JSON.stringify(data) }),

  getBookings: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return fetchAPI<{ bookings: any[]; total: number }>(`/api/bookings${qs}`);
  },

  getBooking: (ref: string) =>
    fetchAPI<any>(`/api/bookings/${ref}`),

  updateBookingStatus: (ref: string, data: any) =>
    fetchAPI<any>(`/api/bookings/${ref}/status`, { method: "PATCH", body: JSON.stringify(data) }),

  getBookingStats: () =>
    fetchAPI<any>("/api/bookings/stats/summary"),

  // Admin
  getDashboard: () =>
    fetchAPI<any>("/api/admin/dashboard"),

  bulkPricingUpdate: (data: any) =>
    fetchAPI<any>("/api/admin/pricing/bulk-update", { method: "POST", body: JSON.stringify(data) }),

  getCustomers: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return fetchAPI<{ customers: any[]; total: number }>(`/api/admin/customers${qs}`);
  },
};
