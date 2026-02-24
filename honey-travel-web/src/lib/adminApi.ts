const API_URL = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function adminFetch<T>(path: string, options?: RequestInit & { rawResponse?: boolean }): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Handle file uploads
  if (options?.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      window.location.href = "/admin";
    }
    const err = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  // For file downloads
  if (options?.rawResponse) {
    return res as unknown as T;
  }

  return res.json();
}

export const adminApi = {
  // Auth
  login: (email: string, password: string, mfa_code?: string) =>
    adminFetch<{ access_token?: string; mfa_required?: boolean; user?: any; permissions?: string[] }>(
      "/api/admin/auth/login",
      { method: "POST", body: JSON.stringify({ email, password, mfa_code }) }
    ),

  getMe: () => adminFetch<{ user: any; permissions: string[] }>("/api/admin/auth/me"),

  changePassword: (current_password: string, new_password: string) =>
    adminFetch<{ success: boolean }>("/api/admin/auth/password/change", {
      method: "POST", body: JSON.stringify({ current_password, new_password }),
    }),

  setupMfa: () => adminFetch<{ secret: string; provisioning_uri: string }>("/api/admin/auth/mfa/setup", { method: "POST" }),

  verifyMfa: (code: string) => adminFetch<{ mfa_enabled: boolean; recovery_codes: string[] }>(
    "/api/admin/auth/mfa/verify", { method: "POST", body: JSON.stringify({ code }) }
  ),

  // Admin Users
  listUsers: () => adminFetch<{ users: any[] }>("/api/admin/auth/users"),
  createUser: (data: any) => adminFetch<{ user: any }>("/api/admin/auth/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => adminFetch<{ user: any }>(`/api/admin/auth/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Roles
  listRoles: () => adminFetch<{ roles: any[] }>("/api/admin/auth/roles"),

  // Dashboard
  getDashboard: () => adminFetch<any>("/api/admin/dashboard"),

  // Hotels
  listHotels: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return adminFetch<{ hotels: any[]; total: number; page: number; pages: number }>(`/api/admin/hotels${qs}`);
  },

  getHotel: (hotelId: string) => adminFetch<any>(`/api/admin/hotels/${hotelId}`),
  createHotel: (data: any) => adminFetch<{ hotel: any }>("/api/admin/hotels", { method: "POST", body: JSON.stringify(data) }),
  updateHotel: (hotelId: string, data: any) => adminFetch<{ hotel: any }>(`/api/admin/hotels/${hotelId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteHotel: (hotelId: string) => adminFetch<{ success: boolean }>(`/api/admin/hotels/${hotelId}`, { method: "DELETE" }),

  // Variants
  updateVariant: (hotelId: string, variantId: string, data: any) =>
    adminFetch<{ variant: any }>(`/api/admin/hotels/${hotelId}/variants/${variantId}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Offers
  listOffers: () => adminFetch<{ offers: any[] }>("/api/admin/hotels/offers/all"),
  createOffer: (data: any) => adminFetch<{ offer: any }>("/api/admin/hotels/offers", { method: "POST", body: JSON.stringify(data) }),
  deleteOffer: (id: number) => adminFetch<{ success: boolean }>(`/api/admin/hotels/offers/${id}`, { method: "DELETE" }),

  // Seasons
  listSeasons: () => adminFetch<{ seasons: any[] }>("/api/admin/hotels/seasons/all"),
  createSeason: (data: any) => adminFetch<{ season: any }>("/api/admin/hotels/seasons", { method: "POST", body: JSON.stringify(data) }),
  deleteSeason: (id: number) => adminFetch<{ success: boolean }>(`/api/admin/hotels/seasons/${id}`, { method: "DELETE" }),

  // Pricing
  bulkPricingUpdate: (data: any) =>
    adminFetch<any>("/api/admin/hotels/pricing/bulk-update", { method: "POST", body: JSON.stringify(data) }),

  // Bookings
  listBookings: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return adminFetch<{ bookings: any[]; total: number; page: number; pages: number }>(`/api/admin/bookings${qs}`);
  },

  getBooking: (ref: string) => adminFetch<any>(`/api/admin/bookings/${ref}`),
  updateBookingStatus: (ref: string, data: any) =>
    adminFetch<any>(`/api/admin/bookings/${ref}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  addPaymentEvent: (ref: string, data: any) =>
    adminFetch<any>(`/api/admin/bookings/${ref}/payment-events`, { method: "POST", body: JSON.stringify(data) }),
  addWhatsAppLog: (ref: string, data: any) =>
    adminFetch<any>(`/api/admin/bookings/${ref}/whatsapp-log`, { method: "POST", body: JSON.stringify(data) }),

  // CRM
  listCustomers: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return adminFetch<{ customers: any[]; total: number; page: number; pages: number }>(`/api/admin/crm/customers${qs}`);
  },

  getCustomer360: (id: number) => adminFetch<any>(`/api/admin/crm/customers/${id}`),
  updateCustomer: (id: number, data: any) => adminFetch<any>(`/api/admin/crm/customers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  updateCustomerTags: (id: number, tags: string[]) =>
    adminFetch<any>(`/api/admin/crm/customers/${id}/tags`, { method: "PUT", body: JSON.stringify({ tags }) }),
  addCustomerNote: (id: number, data: any) =>
    adminFetch<any>(`/api/admin/crm/customers/${id}/notes`, { method: "POST", body: JSON.stringify(data) }),

  // Products
  listProducts: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<{ products: any[] }>(`/api/admin/products${qs}`);
  },
  createProduct: (data: any) => adminFetch<{ product: any }>("/api/admin/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => adminFetch<{ product: any }>(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: number) => adminFetch<{ success: boolean }>(`/api/admin/products/${id}`, { method: "DELETE" }),

  // Suppliers
  listSuppliers: () => adminFetch<{ suppliers: any[] }>("/api/admin/products/suppliers/all"),
  createSupplier: (data: any) => adminFetch<{ supplier: any }>("/api/admin/products/suppliers", { method: "POST", body: JSON.stringify(data) }),

  // Import/Export
  previewImport: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/api/admin/import-export/hotels/preview-import`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Import preview failed");
    return res.json();
  },

  importHotels: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/api/admin/import-export/hotels/import`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Import failed");
    return res.json();
  },

  exportHotels: (format: string) => `${API_URL}/api/admin/import-export/hotels/export?format=${format}`,
  exportBookings: (params?: string) => `${API_URL}/api/admin/import-export/bookings/export${params ? '?' + params : ''}`,
  exportCustomers: () => `${API_URL}/api/admin/import-export/customers/export`,
  downloadTemplate: () => `${API_URL}/api/admin/import-export/templates/hotels`,

  listJobs: () => adminFetch<{ jobs: any[]; total: number }>("/api/admin/import-export/jobs"),

  // Analytics
  getKpis: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<any>(`/api/admin/analytics/kpis${qs}`);
  },
  getRevenueByChannel: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<any>(`/api/admin/analytics/revenue-by-channel${qs}`);
  },
  getRevenueByDay: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<any>(`/api/admin/analytics/revenue-by-day${qs}`);
  },
  getTopHotels: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<any>(`/api/admin/analytics/top-hotels${qs}`);
  },
  getBookingsByStatus: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<any>(`/api/admin/analytics/bookings-by-status${qs}`);
  },
  getPaymentMethods: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return adminFetch<any>(`/api/admin/analytics/payment-methods${qs}`);
  },
  getDistrictPerformance: () => adminFetch<any>("/api/admin/analytics/district-performance"),

  // Audit Logs
  getAuditLogs: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {} as Record<string, string>)
    ).toString() : "";
    return adminFetch<{ logs: any[]; total: number }>(`/api/admin/auth/audit-logs${qs}`);
  },
};
