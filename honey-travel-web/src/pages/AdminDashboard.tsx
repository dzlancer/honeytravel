import { useEffect, useState, useCallback } from "react";
import {
  BarChart3, Users, Hotel, CreditCard, TrendingUp, CheckCircle, XCircle,
  LogOut, Shield, Upload, Download, Package, Settings, Search, Plus,
  Eye, Edit, Trash2, MessageSquare, Star,
  DollarSign, ChevronLeft, ChevronRight, RefreshCw,
  Clock,
} from "lucide-react";
import { adminApi, setToken, clearToken, isAuthenticated } from "../lib/adminApi";

// ─── Login Screen ───────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@honeytravelcheraga.com");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminApi.login(email, password, mfaCode || undefined);
      if (res.mfa_required) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }
      if (res.access_token) {
        setToken(res.access_token);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-amber-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Honey Travel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Istanbul Gateway Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          {mfaRequired && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">MFA Code</label>
              <input type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="6-digit code" maxLength={6} />
            </div>
          )}
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-6">Password recovery: contact@honeytravelcheraga.com</p>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
const fmtPrice = (v: number) => v ? `${Math.round(v).toLocaleString()} DZD` : "0 DZD";
const fmtDate = (d: string | null) => d ? d.split("T")[0] : "-";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  no_show: "bg-gray-100 text-gray-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  refunded: "bg-purple-100 text-purple-700",
};

type Tab = "dashboard" | "hotels" | "bookings" | "crm" | "products" | "import_export" | "analytics" | "settings";

// ─── Main Admin Dashboard ───────────────────────────────────
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [tab, setTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [_permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (authenticated) {
      adminApi.getMe().then(res => {
        setUser(res.user);
        setPermissions(res.permissions);
      }).catch(() => {
        clearToken();
        setAuthenticated(false);
      });
    }
  }, [authenticated]);

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
    setUser(null);
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
    { id: "hotels", label: "Hotels", icon: <Hotel size={18} /> },
    { id: "bookings", label: "Bookings", icon: <CreditCard size={18} /> },
    { id: "crm", label: "CRM", icon: <Users size={18} /> },
    { id: "products", label: "Products", icon: <Package size={18} /> },
    { id: "import_export", label: "Import/Export", icon: <Upload size={18} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Shield className="text-amber-600" size={18} />
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">Honey Travel Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">{user?.email}</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              {user?.role_name?.replace("_", " ")}
            </span>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === tb.id ? "bg-amber-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}>
                {tb.icon}
                <span className="hidden sm:inline">{tb.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "hotels" && <HotelsTab />}
        {tab === "bookings" && <BookingsTab />}
        {tab === "crm" && <CrmTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "import_export" && <ImportExportTab />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "settings" && <SettingsTab user={user} />}
      </div>
    </div>
  );
}

// ─── Dashboard Tab ──────────────────────────────────────────
function DashboardTab() {
  const [data, setData] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getDashboard(), adminApi.getKpis()]).then(([d, k]) => {
      setData(d);
      setKpis(k);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Active Hotels", value: data?.active_hotels || 0, icon: <Hotel size={20} />, color: "bg-blue-50 text-blue-600" },
          { label: "Total Bookings", value: kpis?.total_bookings || 0, icon: <CreditCard size={20} />, color: "bg-green-50 text-green-600" },
          { label: "Revenue", value: fmtPrice(kpis?.total_revenue_dzd || 0), icon: <DollarSign size={20} />, color: "bg-amber-50 text-amber-600" },
          { label: "Conversion", value: `${kpis?.conversion_rate || 0}%`, icon: <TrendingUp size={20} />, color: "bg-purple-50 text-purple-600" },
          { label: "Customers", value: kpis?.total_customers || 0, icon: <Users size={20} />, color: "bg-pink-50 text-pink-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Channel</h3>
          {data?.revenue_by_channel?.length > 0 ? (
            <div className="space-y-3">
              {data.revenue_by_channel.map((ch: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"][i % 4] }} />
                    <span className="text-sm capitalize">{ch.channel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{ch.bookings} bookings</span>
                    <span className="text-xs text-gray-400 ml-2">{fmtPrice(ch.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No data yet</p>}
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {Object.entries(data?.bookings_by_status || {}).map(([status, count]: any) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || "bg-gray-100"}`}>{status}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-xs text-gray-500">AOV (Avg Order Value)</p>
          <p className="text-xl font-bold mt-1">{fmtPrice(kpis?.avg_order_value_dzd || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Target: 45,000 DZD</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{kpis?.pending_bookings || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-xs text-gray-500">Cancelled</p>
          <p className="text-xl font-bold text-red-500 mt-1">{kpis?.cancelled_bookings || 0}</p>
          <p className="text-xs text-gray-400 mt-1">This period</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-xs text-gray-500">New Customers</p>
          <p className="text-xl font-bold text-green-600 mt-1">{kpis?.new_customers || 0}</p>
          <p className="text-xs text-gray-400 mt-1">This period</p>
        </div>
      </div>
    </div>
  );
}

// ─── Hotels Tab ─────────────────────────────────────────────
function HotelsTab() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editHotel, setEditHotel] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      const res = await adminApi.listHotels(params);
      setHotels(res.hotels);
      setTotal(res.total);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { loadHotels(); }, [loadHotels]);

  const handleDelete = async (hotelId: string) => {
    if (!confirm("Deactivate this hotel?")) return;
    await adminApi.deleteHotel(hotelId);
    loadHotels();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search hotels..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
          <Plus size={16} /> Add Hotel
        </button>
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stars</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price (DZD)</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Variants</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center"><Spinner /></td></tr>
              ) : hotels.length > 0 ? hotels.map(h => (
                <tr key={h.hotel_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{h.hotel_id}</td>
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{h.name}</td>
                  <td className="px-4 py-3 text-xs">{h.district}</td>
                  <td className="px-4 py-3">{"★".repeat(h.star_rating)}</td>
                  <td className="px-4 py-3 font-medium">{fmtPrice(h.sale_price_dzd)}</td>
                  <td className="px-4 py-3">{h.variant_count || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${h.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {h.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditHotel(h)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(h.hotel_id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Deactivate"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No hotels found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-gray-500">{total} hotels total</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 disabled:opacity-30"><ChevronLeft size={18} /></button>
              <span className="text-sm">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={hotels.length < 20} className="p-1 disabled:opacity-30"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editHotel && <HotelEditModal hotel={editHotel} onClose={() => setEditHotel(null)} onSaved={loadHotels} />}
      {showCreate && <HotelCreateModal onClose={() => setShowCreate(false)} onCreated={loadHotels} />}
    </div>
  );
}

function HotelEditModal({ hotel, onClose, onSaved }: { hotel: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: hotel.name || "", description_fr: hotel.description_fr || hotel.description || "",
    star_rating: hotel.star_rating || 3, district: hotel.district || "",
    address: hotel.address || "", sale_price_dzd: hotel.sale_price_dzd || 0,
    total_rooms: hotel.total_rooms || 20, available_rooms: hotel.available_rooms || 15,
    is_active: hotel.is_active !== false,
  });
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getHotel(hotel.hotel_id).then(data => {
      setVariants(data.variants || []);
    }).catch(() => {});
  }, [hotel.hotel_id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateHotel(hotel.hotel_id, form);
      onSaved();
      onClose();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  const updateVariant = async (variantId: string, field: string, value: any) => {
    try {
      await adminApi.updateVariant(hotel.hotel_id, variantId, { [field]: value });
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Hotel: {hotel.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">District</label>
              <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description (FR)</label>
            <textarea value={form.description_fr} onChange={e => setForm({...form, description_fr: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Stars</label>
              <select value={form.star_rating} onChange={e => setForm({...form, star_rating: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none">
                {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} Stars</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Sale Price (DZD)</label>
              <input type="number" value={form.sale_price_dzd} onChange={e => setForm({...form, sale_price_dzd: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Rooms</label>
              <input type="number" value={form.total_rooms} onChange={e => setForm({...form, total_rooms: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} id="active" />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Variants</h3>
              <div className="space-y-2">
                {variants.map((v: any) => (
                  <div key={v.variant_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-mono w-24">{v.variant_id}</span>
                    <span className="text-sm">{v.nights}N</span>
                    <input type="number" defaultValue={v.sale_price_dzd}
                      onBlur={e => updateVariant(v.variant_id, "sale_price_dzd", Number(e.target.value))}
                      className="w-28 px-2 py-1 border rounded text-sm" />
                    <span className="text-xs text-gray-400">DZD</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HotelCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    hotel_id: "", name: "", slug: "", description_fr: "", star_rating: 3,
    district: "", address: "", base_price_dzd: 35000, latitude: 41.0082, longitude: 28.9784,
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
      await adminApi.createHotel({ ...form, slug, sale_price_dzd: form.base_price_dzd });
      onCreated();
      onClose();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b"><h2 className="text-lg font-bold">Add New Hotel</h2></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Hotel ID</label>
              <input type="text" value={form.hotel_id} onChange={e => setForm({...form, hotel_id: e.target.value})}
                placeholder="HT0063" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">District</label>
              <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Base Price (DZD)</label>
              <input type="number" value={form.base_price_dzd} onChange={e => setForm({...form, base_price_dzd: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Description (FR)</label>
            <textarea value={form.description_fr} onChange={e => setForm({...form, description_fr: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" rows={3} />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? "Creating..." : "Create Hotel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bookings Tab ───────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailRef, setDetailRef] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 30 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.listBookings(params);
      setBookings(res.bookings);
      setTotal(res.total);
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const updateStatus = async (ref: string, status: string) => {
    await adminApi.updateBookingStatus(ref, { status });
    loadBookings();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search booking ref..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">All Statuses</option>
          {["pending", "confirmed", "cancelled", "completed", "no_show"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ref</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hotel</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nights</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center"><Spinner /></td></tr>
              ) : bookings.map(b => (
                <tr key={b.booking_ref} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{b.booking_ref}</td>
                  <td className="px-4 py-3 text-xs max-w-32 truncate">{b.hotel_name || b.hotel_id}</td>
                  <td className="px-4 py-3 text-xs">{b.customer_name || "-"}</td>
                  <td className="px-4 py-3 text-xs">{fmtDate(b.check_in)}</td>
                  <td className="px-4 py-3">{b.nights}N</td>
                  <td className="px-4 py-3 font-medium">{fmtPrice(b.final_price_dzd)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[b.payment_status] || "bg-gray-100"}`}>{b.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[b.status] || "bg-gray-100"}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setDetailRef(b.booking_ref)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="View"><Eye size={15} /></button>
                      {b.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(b.booking_ref, "confirmed")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Confirm"><CheckCircle size={15} /></button>
                          <button onClick={() => updateStatus(b.booking_ref, "cancelled")} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-xs text-gray-500">{total} bookings</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="text-sm">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={bookings.length < 30} className="p-1 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {detailRef && <BookingDetailModal bookingRef={detailRef} onClose={() => setDetailRef(null)} onUpdated={loadBookings} />}
    </div>
  );
}

function BookingDetailModal({ bookingRef, onClose }: { bookingRef: string; onClose: () => void; onUpdated?: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState("payment_received");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  useEffect(() => {
    adminApi.getBooking(bookingRef).then(setData).finally(() => setLoading(false));
  }, [bookingRef]);

  const addPayment = async () => {
    await adminApi.addPaymentEvent(bookingRef, {
      type: paymentType, amount_dzd: Number(paymentAmount) || null, reference: paymentRef || null,
    });
    adminApi.getBooking(bookingRef).then(setData);
    setPaymentAmount(""); setPaymentRef("");
  };

  if (loading) return <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><Spinner /></div>;
  if (!data) return null;

  const { booking, hotel, customer, payment_events, whatsapp_messages } = data;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{booking.booking_ref}</h2>
            <p className="text-sm text-gray-500">{hotel?.name} - {booking.nights}N</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs text-gray-500">Status</p><span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>{booking.status}</span></div>
            <div><p className="text-xs text-gray-500">Payment</p><span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.payment_status]}`}>{booking.payment_status}</span></div>
            <div><p className="text-xs text-gray-500">Amount</p><p className="font-bold">{fmtPrice(booking.final_price_dzd)}</p></div>
            <div><p className="text-xs text-gray-500">Check-in</p><p className="font-medium">{fmtDate(booking.check_in)}</p></div>
          </div>

          {/* Customer */}
          {customer && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2">Customer</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {customer.full_name}</p>
                <p><span className="text-gray-500">Phone:</span> {customer.whatsapp_phone}</p>
                <p><span className="text-gray-500">Email:</span> {customer.email || "-"}</p>
                <p><span className="text-gray-500">City:</span> {customer.city || "-"}</p>
              </div>
            </div>
          )}

          {/* Payment Events */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Payment Timeline</h3>
            {payment_events?.length > 0 ? (
              <div className="space-y-2">
                {payment_events.map((pe: any) => (
                  <div key={pe.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                    <Clock size={14} className="text-gray-400" />
                    <span className="font-medium">{pe.type.replace(/_/g, " ")}</span>
                    {pe.amount_dzd && <span>{fmtPrice(pe.amount_dzd)}</span>}
                    {pe.reference && <span className="text-xs text-gray-400">Ref: {pe.reference}</span>}
                    <span className="text-xs text-gray-400 ml-auto">{fmtDate(pe.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No payment events</p>}

            {/* Add Payment Event */}
            <div className="flex gap-2 mt-3">
              <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                <option value="payment_received">Payment Received</option>
                <option value="invoice_sent">Invoice Sent</option>
                <option value="refund_issued">Refund Issued</option>
                <option value="reminder_sent">Reminder Sent</option>
              </select>
              <input type="number" placeholder="Amount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                className="w-28 px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Reference" value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={addPayment} className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm">Add</button>
            </div>
          </div>

          {/* WhatsApp Messages */}
          <div>
            <h3 className="text-sm font-semibold mb-2">WhatsApp Messages</h3>
            {whatsapp_messages?.length > 0 ? (
              <div className="space-y-2">
                {whatsapp_messages.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                    <MessageSquare size={14} className={m.direction === "outbound" ? "text-green-500" : "text-blue-500"} />
                    <span className="text-xs font-medium">{m.direction}</span>
                    <span className="flex-1 text-xs truncate">{m.body || m.template_key || "-"}</span>
                    <span className="text-xs text-gray-400">{fmtDate(m.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No messages logged</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CRM Tab ────────────────────────────────────────────────
function CrmTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 30 };
      if (search) params.search = search;
      const res = await adminApi.listCustomers(params);
      setCustomers(res.customers);
      setTotal(res.total);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search customers..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total Spend</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">VIP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center"><Spinner /></td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.full_name || "-"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.whatsapp_phone}</td>
                  <td className="px-4 py-3 text-xs">{c.city || "-"}</td>
                  <td className="px-4 py-3">{c.total_bookings}</td>
                  <td className="px-4 py-3 font-medium">{fmtPrice(c.total_spend_dzd || 0)}</td>
                  <td className="px-4 py-3">{c.is_vip ? <Star size={14} className="text-amber-500 fill-amber-500" /> : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).map((t: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetail(c.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="View 360"><Eye size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-xs text-gray-500">{total} customers</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="text-sm">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={customers.length < 30} className="p-1 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {detail && <Customer360Modal customerId={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function Customer360Modal({ customerId, onClose }: { customerId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");

  const load = () => adminApi.getCustomer360(customerId).then(setData).finally(() => setLoading(false));
  useEffect(() => { load(); }, [customerId]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    await adminApi.addCustomerNote(customerId, { content: newNote });
    setNewNote("");
    load();
  };

  const addTag = async () => {
    if (!newTag.trim() || !data) return;
    const currentTags = data.customer.tags || [];
    await adminApi.updateCustomerTags(customerId, [...currentTags, newTag]);
    setNewTag("");
    load();
  };

  if (loading) return <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><Spinner /></div>;
  if (!data) return null;

  const { customer, bookings, notes, timeline, stats } = data;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{customer.full_name || "Customer"} {customer.is_vip && <Star size={16} className="inline text-amber-500 fill-amber-500" />}</h2>
            <p className="text-sm text-gray-500">{customer.whatsapp_phone} | {customer.email || "No email"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-xl p-4"><p className="text-xs text-green-600">Total Spend</p><p className="text-lg font-bold text-green-700">{fmtPrice(stats.total_spend_dzd)}</p></div>
            <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs text-blue-600">Bookings</p><p className="text-lg font-bold text-blue-700">{stats.confirmed_bookings}</p></div>
            <div className="bg-amber-50 rounded-xl p-4"><p className="text-xs text-amber-600">AOV</p><p className="text-lg font-bold text-amber-700">{fmtPrice(stats.avg_order_value)}</p></div>
            <div className="bg-purple-50 rounded-xl p-4"><p className="text-xs text-purple-600">Loyalty Points</p><p className="text-lg font-bold text-purple-700">{stats.loyalty_points}</p></div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex gap-2 flex-wrap items-center">
              {(customer.tags || []).map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{tag}</span>
              ))}
              <div className="flex gap-1">
                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag"
                  className="px-2 py-1 border rounded-lg text-xs w-24" onKeyDown={e => e.key === "Enter" && addTag()} />
                <button onClick={addTag} className="text-xs px-2 py-1 bg-blue-500 text-white rounded-lg">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Booking History ({bookings.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bookings.map((b: any) => (
                  <div key={b.booking_ref} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono font-medium">{b.booking_ref}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{b.hotel_name} | {b.nights}N | {fmtPrice(b.final_price_dzd)}</p>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-sm text-gray-400">No bookings</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Internal Notes</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {notes.map((n: any) => (
                  <div key={n.id} className="p-3 bg-yellow-50 rounded-lg text-sm border border-yellow-100">
                    <p>{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.author_name} - {fmtDate(n.created_at)}</p>
                  </div>
                ))}
                {notes.length === 0 && <p className="text-sm text-gray-400">No notes</p>}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm" onKeyDown={e => e.key === "Enter" && addNote()} />
                <button onClick={addNote} className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm">Add</button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Activity Timeline</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {timeline.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                  <span className="font-medium">{e.title}</span>
                  <span className="text-xs text-gray-400 ml-auto">{fmtDate(e.created_at)}</span>
                </div>
              ))}
              {timeline.length === 0 && <p className="text-sm text-gray-400">No activity</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ───────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      const res = await adminApi.listProducts(params);
      setProducts(res.products);
    } catch {}
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("Deactivate this product?")) return;
    await adminApi.deleteProduct(id);
    load();
  };

  const productTypes = ["excursion", "transfer", "pass", "cruise", "other"];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm">
            <option value="">All Types</option>
            {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <Spinner /> : products.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">{p.type}</span>
              <div className="flex gap-1">
                <button onClick={() => handleDelete(p.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{p.title}</h3>
            {p.title_fr && <p className="text-xs text-gray-500 mt-1">{p.title_fr}</p>}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description || p.description_fr || "-"}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="font-bold text-amber-600">{fmtPrice(p.price_dzd)}</span>
              {p.duration_hours && <span className="text-xs text-gray-400">{p.duration_hours}h</span>}
            </div>
            {p.supplier_name && <p className="text-xs text-gray-400 mt-1">Supplier: {p.supplier_name}</p>}
          </div>
        ))}
      </div>

      {showCreate && <ProductCreateModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

function ProductCreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    type: "excursion", title: "", title_fr: "", description: "",
    price_dzd: 5000, duration_hours: 0, max_participants: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await adminApi.createProduct(form);
      onCreated();
      onClose();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b"><h2 className="text-lg font-bold">Add Product</h2></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                {["excursion", "transfer", "pass", "cruise", "other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Price (DZD)</label>
              <input type="number" value={form.price_dzd} onChange={e => setForm({...form, price_dzd: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Title (EN)</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Title (FR)</label>
            <input type="text" value={form.title_fr} onChange={e => setForm({...form, title_fr: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Duration (hours)</label>
              <input type="number" value={form.duration_hours} onChange={e => setForm({...form, duration_hours: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Max Participants</label>
              <input type="number" value={form.max_participants} onChange={e => setForm({...form, max_participants: Number(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Import/Export Tab ──────────────────────────────────────
function ImportExportTab() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    adminApi.listJobs().then(res => setJobs(res.jobs)).catch(() => {});
  }, [importResult]);

  const handlePreview = async () => {
    if (!importFile) return;
    setLoading(true);
    setPreview(null);
    try {
      const res = await adminApi.previewImport(importFile);
      setPreview(res);
    } catch (err: any) { alert(err.message); }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setLoading(true);
    try {
      const res = await adminApi.importHotels(importFile);
      setImportResult(res);
      setPreview(null);
    } catch (err: any) { alert(err.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Upload size={18} /> Import Hotels</h3>
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1">CSV File</label>
              <input type="file" accept=".csv" onChange={e => setImportFile(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
            </div>
            <button onClick={handlePreview} disabled={!importFile || loading}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {loading ? "Loading..." : "Preview"}
            </button>
          </div>

          <a href={adminApi.downloadTemplate()} target="_blank" rel="noopener noreferrer"
            className="text-xs text-amber-600 hover:underline inline-flex items-center gap-1">
            <Download size={12} /> Download CSV Template
          </a>

          {/* Preview Results */}
          {preview && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-2">Preview Results</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><p className="text-lg font-bold">{preview.total_rows}</p><p className="text-xs text-gray-500">Total Rows</p></div>
                <div className="text-center"><p className="text-lg font-bold text-green-600">{preview.creates}</p><p className="text-xs text-gray-500">New Hotels</p></div>
                <div className="text-center"><p className="text-lg font-bold text-blue-600">{preview.updates}</p><p className="text-xs text-gray-500">Updates</p></div>
                <div className="text-center"><p className="text-lg font-bold text-red-600">{preview.error_rows}</p><p className="text-xs text-gray-500">Errors</p></div>
              </div>
              {preview.errors?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
                  {preview.errors.slice(0, 10).map((e: string, i: number) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}
              <button onClick={handleImport} disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {loading ? "Importing..." : `Confirm Import (${preview.valid_rows} rows)`}
              </button>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2">Import Complete</h4>
              <p className="text-sm">Created: {importResult.created} | Updated: {importResult.updated} | Errors: {importResult.errors?.length || 0}</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Download size={18} /> Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-xl p-4">
            <h4 className="font-medium mb-2">Hotels</h4>
            <p className="text-xs text-gray-500 mb-3">Export all hotel data</p>
            <div className="flex gap-2">
              <a href={adminApi.exportHotels("csv")} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium">CSV</a>
              <a href={adminApi.exportHotels("xlsx")} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium">XLSX</a>
            </div>
          </div>
          <div className="border rounded-xl p-4">
            <h4 className="font-medium mb-2">Bookings</h4>
            <p className="text-xs text-gray-500 mb-3">Export booking records</p>
            <a href={adminApi.exportBookings()} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium">CSV</a>
          </div>
          <div className="border rounded-xl p-4">
            <h4 className="font-medium mb-2">Customers</h4>
            <p className="text-xs text-gray-500 mb-3">Export customer data</p>
            <a href={adminApi.exportCustomers()} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium">CSV</a>
          </div>
        </div>
      </div>

      {/* Jobs History */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Import/Export History</h3>
          <div className="space-y-2">
            {jobs.map(j => (
              <div key={j.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <span className={`text-xs px-2 py-1 rounded-full ${j.status === "completed" ? "bg-green-100 text-green-700" : j.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {j.status}
                </span>
                <span className="font-medium">{j.type.replace(/_/g, " ")}</span>
                <span className="text-xs text-gray-400">{j.total_rows} rows</span>
                <span className="text-xs text-gray-400 ml-auto">{fmtDate(j.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ──────────────────────────────────────────
function AnalyticsTab() {
  const [kpis, setKpis] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [topHotels, setTopHotels] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<Record<string, number>>({});
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params: any = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    try {
      const [k, ch, th, st, pm, dp, dr] = await Promise.all([
        adminApi.getKpis(params),
        adminApi.getRevenueByChannel(params),
        adminApi.getTopHotels(params),
        adminApi.getBookingsByStatus(params),
        adminApi.getPaymentMethods(params),
        adminApi.getDistrictPerformance(),
        adminApi.getRevenueByDay(params),
      ]);
      setKpis(k);
      setChannels(ch.channels);
      setTopHotels(th.hotels);
      setStatusDist(st.statuses);
      setPaymentMethods(pm.methods);
      setDistricts(dp.districts);
      setDailyRevenue(dr.daily);
    } catch {}
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="flex gap-3 items-center">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={load} className="mt-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><RefreshCw size={16} /></button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Revenue" value={fmtPrice(kpis?.total_revenue_dzd || 0)} color="bg-green-50 text-green-600" icon={<DollarSign size={20} />} />
        <KpiCard label="Bookings" value={kpis?.total_bookings || 0} color="bg-blue-50 text-blue-600" icon={<CreditCard size={20} />} />
        <KpiCard label="Conversion" value={`${kpis?.conversion_rate || 0}%`} color="bg-purple-50 text-purple-600" icon={<TrendingUp size={20} />} />
        <KpiCard label="AOV" value={fmtPrice(kpis?.avg_order_value_dzd || 0)} color="bg-amber-50 text-amber-600" icon={<BarChart3 size={20} />} />
        <KpiCard label="New Customers" value={kpis?.new_customers || 0} color="bg-pink-50 text-pink-600" icon={<Users size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Revenue by Channel</h3>
          {channels.length > 0 ? (
            <div className="space-y-3">
              {channels.map((ch, i) => {
                const maxRev = Math.max(...channels.map(c => c.revenue || 1));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{ch.channel}</span>
                      <span className="font-medium">{fmtPrice(ch.revenue)} ({ch.bookings})</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(ch.revenue / maxRev) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400">No data</p>}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Payment Methods</h3>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((m, i) => {
                const maxCount = Math.max(...paymentMethods.map(x => x.count || 1));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{m.method.replace(/_/g, " ")}</span>
                      <span className="font-medium">{m.count} ({fmtPrice(m.revenue)})</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400">No data</p>}
        </div>

        {/* Top Hotels */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Top Hotels by Revenue</h3>
          {topHotels.length > 0 ? (
            <div className="space-y-2">
              {topHotels.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="flex-1 truncate">{h.hotel_name}</span>
                  <span className="text-xs text-gray-400">{h.bookings} bookings</span>
                  <span className="font-medium">{fmtPrice(h.revenue)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No data</p>}
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {Object.entries(statusDist).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || "bg-gray-100"}`}>{status}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* District Performance */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">District Performance</h3>
          {districts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">District</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Hotels</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Avg Price</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Bookings</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {districts.map((d, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium">{d.district}</td>
                      <td className="px-3 py-2">{d.hotel_count}</td>
                      <td className="px-3 py-2">{fmtPrice(d.avg_price)}</td>
                      <td className="px-3 py-2">{d.total_bookings}</td>
                      <td className="px-3 py-2 font-medium">{fmtPrice(d.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-gray-400">No data</p>}
        </div>
      </div>

      {/* Daily Revenue Chart (simple bar) */}
      {dailyRevenue.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Daily Revenue Trend</h3>
          <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
            {dailyRevenue.map((d, i) => {
              const maxRev = Math.max(...dailyRevenue.map(x => x.revenue || 1));
              const height = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center min-w-8" title={`${d.date}: ${fmtPrice(d.revenue)}`}>
                  <div className="w-6 bg-amber-400 rounded-t" style={{ height: `${Math.max(height, 2)}%` }} />
                  <span className="text-[9px] text-gray-400 mt-1 rotate-45 origin-left">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color, icon }: { label: string; value: any; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────
function SettingsTab({ user }: { user: any }) {
  const [activeSection, setActiveSection] = useState<"profile" | "password" | "mfa" | "users" | "roles" | "seasons" | "pricing" | "audit">("profile");
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  // MFA
  const [mfaUri, setMfaUri] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaResult, setMfaResult] = useState<any>(null);

  // Pricing
  const [pDistrict, setPDistrict] = useState("");
  const [pAdjust, setPAdjust] = useState(0);
  const [pResult, setPResult] = useState("");

  // Season form
  const [seasonForm, setSeasonForm] = useState({ name: "", starts_at: "", ends_at: "", multiplier: 1.0, color: "#3b82f6" });

  useEffect(() => {
    if (activeSection === "users") adminApi.listUsers().then(r => setAdminUsers(r.users)).catch(() => {});
    if (activeSection === "roles") adminApi.listRoles().then(r => setRoles(r.roles)).catch(() => {});
    if (activeSection === "seasons") adminApi.listSeasons().then(r => setSeasons(r.seasons)).catch(() => {});
    if (activeSection === "audit") adminApi.getAuditLogs({ limit: 50 }).then(r => setAuditLogs(r.logs)).catch(() => {});
  }, [activeSection]);

  const changePassword = async () => {
    try {
      await adminApi.changePassword(currentPw, newPw);
      setPwMsg("Password changed successfully!");
      setCurrentPw(""); setNewPw("");
    } catch (err: any) { setPwMsg("Error: " + err.message); }
  };

  const setupMfa = async () => {
    try {
      const res = await adminApi.setupMfa();
      setMfaUri(res.provisioning_uri);
      setMfaSecret(res.secret);
    } catch (err: any) { alert(err.message); }
  };

  const verifyMfa = async () => {
    try {
      const res = await adminApi.verifyMfa(mfaCode);
      setMfaResult(res);
    } catch (err: any) { alert(err.message); }
  };

  const handleBulkPricing = async () => {
    try {
      const data: any = { adjustment_pct: pAdjust };
      if (pDistrict) data.district = pDistrict;
      const res = await adminApi.bulkPricingUpdate(data);
      setPResult(`Updated ${res.variants_updated} variants, ${res.hotels_updated} hotels (${pAdjust > 0 ? "+" : ""}${pAdjust}%)`);
    } catch (err: any) { setPResult("Error: " + err.message); }
  };

  const createSeason = async () => {
    try {
      await adminApi.createSeason(seasonForm);
      adminApi.listSeasons().then(r => setSeasons(r.seasons));
      setSeasonForm({ name: "", starts_at: "", ends_at: "", multiplier: 1.0, color: "#3b82f6" });
    } catch (err: any) { alert(err.message); }
  };

  const deleteSeason = async (id: number) => {
    await adminApi.deleteSeason(id);
    adminApi.listSeasons().then(r => setSeasons(r.seasons));
  };

  const sections = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "mfa", label: "MFA" },
    { id: "pricing", label: "Bulk Pricing" },
    { id: "seasons", label: "Seasons" },
    { id: "users", label: "Admin Users" },
    { id: "roles", label: "Roles" },
    { id: "audit", label: "Audit Log" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap text-left ${
              activeSection === s.id ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}>{s.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border p-6">
        {activeSection === "profile" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Email</p><p className="font-medium">{user?.email}</p></div>
              <div><p className="text-gray-500">Name</p><p className="font-medium">{user?.full_name || "-"}</p></div>
              <div><p className="text-gray-500">Role</p><p className="font-medium capitalize">{user?.role_name?.replace("_", " ")}</p></div>
              <div><p className="text-gray-500">MFA</p><p className="font-medium">{user?.mfa_enabled ? "Enabled" : "Disabled"}</p></div>
              <div><p className="text-gray-500">Last Login</p><p className="font-medium">{fmtDate(user?.last_login_at)}</p></div>
            </div>
          </div>
        )}

        {activeSection === "password" && (
          <div className="space-y-4 max-w-md">
            <h3 className="font-semibold text-lg">Change Password</h3>
            <div>
              <label className="text-sm font-medium block mb-1">Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            {pwMsg && <p className={`text-sm ${pwMsg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{pwMsg}</p>}
            <button onClick={changePassword} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium">Change Password</button>
          </div>
        )}

        {activeSection === "mfa" && (
          <div className="space-y-4 max-w-md">
            <h3 className="font-semibold text-lg">Multi-Factor Authentication</h3>
            {!mfaUri ? (
              <button onClick={setupMfa} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium">Setup MFA (TOTP)</button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm">Scan this URI with your authenticator app:</p>
                <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono break-all">{mfaUri}</div>
                <p className="text-xs text-gray-500">Secret: {mfaSecret}</p>
                <div className="flex gap-2">
                  <input type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value)} placeholder="6-digit code"
                    className="px-3 py-2 border rounded-lg text-sm" maxLength={6} />
                  <button onClick={verifyMfa} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium">Verify</button>
                </div>
                {mfaResult && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-700 mb-2">MFA Enabled! Save these recovery codes:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {mfaResult.recovery_codes?.map((c: string, i: number) => (
                        <span key={i} className="text-xs font-mono bg-white px-2 py-1 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === "pricing" && (
          <div className="space-y-4 max-w-md">
            <h3 className="font-semibold text-lg">Bulk Pricing Update</h3>
            <div>
              <label className="text-sm font-medium block mb-1">District (optional)</label>
              <select value={pDistrict} onChange={e => setPDistrict(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">All Districts</option>
                {["Laleli", "Beyazit", "Yenikapi", "Fatih", "Findikzade", "Sultanahmet", "Sisli", "Bomonti", "Taksim", "Harbiye", "Topkapi", "Bayrampasa"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Adjustment (%)</label>
              <input type="number" value={pAdjust} onChange={e => setPAdjust(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
              <p className="text-xs text-gray-400 mt-1">Positive = increase, Negative = decrease</p>
            </div>
            {pResult && <p className={`text-sm ${pResult.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{pResult}</p>}
            <button onClick={handleBulkPricing} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium">Apply Update</button>
          </div>
        )}

        {activeSection === "seasons" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Seasonality Calendar</h3>
            {/* Existing Seasons */}
            <div className="space-y-2">
              {seasons.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: s.color }} />
                  <span className="font-medium flex-1">{s.name}</span>
                  <span className="text-xs text-gray-500">{fmtDate(s.starts_at)} - {fmtDate(s.ends_at)}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{s.multiplier}x</span>
                  <button onClick={() => deleteSeason(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
              {seasons.length === 0 && <p className="text-sm text-gray-400">No seasons defined</p>}
            </div>
            {/* Add Season */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Add Season</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Name (e.g. Summer Peak)" value={seasonForm.name}
                  onChange={e => setSeasonForm({...seasonForm, name: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" placeholder="Multiplier" step="0.05" value={seasonForm.multiplier}
                  onChange={e => setSeasonForm({...seasonForm, multiplier: Number(e.target.value)})}
                  className="px-3 py-2 border rounded-lg text-sm" />
                <input type="date" value={seasonForm.starts_at} onChange={e => setSeasonForm({...seasonForm, starts_at: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-sm" />
                <input type="date" value={seasonForm.ends_at} onChange={e => setSeasonForm({...seasonForm, ends_at: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <button onClick={createSeason} className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium">Add Season</button>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Admin Users</h3>
            <div className="space-y-2">
              {adminUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
                    {(u.full_name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.full_name || u.email}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">{u.role_name?.replace("_", " ")}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "roles" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Roles & Permissions</h3>
            <div className="space-y-3">
              {roles.map(r => (
                <div key={r.id} className="border rounded-xl p-4">
                  <h4 className="font-medium capitalize">{r.name.replace("_", " ")}</h4>
                  <p className="text-xs text-gray-500 mb-2">{r.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    {(r.permissions || []).map((p: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "audit" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Audit Log</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map(l => (
                <div key={l.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-xs text-gray-400 w-20">{fmtDate(l.created_at)}</span>
                  <span className="text-xs font-medium">{l.actor_email}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{l.action}</span>
                  <span className="text-xs text-gray-500">{l.entity_type} {l.entity_id || ""}</span>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-gray-400">No audit logs</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Spinner ────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );
}
