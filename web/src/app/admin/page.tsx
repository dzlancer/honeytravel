"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type Tab = "dashboard" | "users" | "promos" | "campaigns" | "system";
type SystemSubTab = "suppliers" | "features" | "audit";

interface PromoForm {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
}

interface CampaignForm {
  name: string;
  subject: string;
  template: "welcome" | "promotional" | "newsletter";
  target: "all_users" | "loyalty_members" | "inactive_users";
  scheduledDate: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  super_admin: "bg-red-100 text-red-800",
  customer: "bg-blue-100 text-blue-800",
  supplier_manager: "bg-orange-100 text-orange-800",
};

const isAdminRole = (role?: string) => role === "admin" || role === "super_admin";
const isSuperAdmin = (role?: string) => role === "super_admin";

// ─── Toggle Switch Component ──────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-primary-600" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const [promos, setPromos] = useState<any[]>([]);
  const [promoForm, setPromoForm] = useState<PromoForm>({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    maxUses: 100,
    validFrom: "",
    validUntil: "",
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignForm, setCampaignForm] = useState<CampaignForm>({
    name: "",
    subject: "",
    template: "promotional",
    target: "all_users",
    scheduledDate: "",
  });

  // System tab state
  const [systemSubTab, setSystemSubTab] = useState<SystemSubTab>("suppliers");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditFilter, setAuditFilter] = useState<string>("");
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdminRole(user.role)) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load data based on active tab
  useEffect(() => {
    if (!user || !isAdminRole(user.role)) return;

    if (activeTab === "dashboard") {
      api.getAdminStats().then(setStats).catch(() => toast.error("Failed to load stats"));
      api.getAdminBookings(10).then((data) => {
        setRecentBookings(Array.isArray(data) ? data : data.bookings || []);
      }).catch(() => {});
    } else if (activeTab === "users") {
      api.getAdminUsers().then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      }).catch(() => toast.error("Failed to load users"));
    } else if (activeTab === "promos") {
      api.getAdminPromos().then((data) => {
        setPromos(Array.isArray(data) ? data : []);
      }).catch(() => toast.error("Failed to load promos"));
    } else if (activeTab === "campaigns") {
      api.getAdminCampaigns().then((data) => {
        setCampaigns(Array.isArray(data) ? data : []);
      }).catch(() => toast.error("Failed to load campaigns"));
    } else if (activeTab === "system") {
      loadSystemData();
    }
  }, [activeTab, user]);

  // Load system sub-tab data
  useEffect(() => {
    if (activeTab !== "system" || !user || !isSuperAdmin(user.role)) return;
    if (systemSubTab === "audit") {
      loadAuditLogs();
    }
  }, [systemSubTab, auditPage, auditFilter]);

  const loadSystemData = useCallback(() => {
    if (!isSuperAdmin(user?.role)) return;
    api.getAdminSuppliers().then((data) => {
      setSuppliers(Array.isArray(data) ? data : []);
    }).catch(() => toast.error("Failed to load suppliers"));
    api.getSystemConfigs().then((data) => {
      setConfigs(Array.isArray(data) ? data : []);
    }).catch(() => toast.error("Failed to load configs"));
  }, [user]);

  const loadAuditLogs = useCallback(() => {
    api.getAuditLogs(auditPage, 20, auditFilter || undefined).then((data) => {
      setAuditLogs(data.items || []);
      setAuditTotal(data.total || 0);
    }).catch(() => toast.error("Failed to load audit logs"));
  }, [auditPage, auditFilter]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.firstName || "").toLowerCase().includes(q) ||
        (u.lastName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const createPromo = async () => {
    if (!promoForm.code) {
      toast.error("Promo code is required");
      return;
    }
    try {
      await api.createAdminPromo(promoForm);
      toast.success("Promo code created");
      setPromoForm({ code: "", discountType: "percentage", discountValue: 10, maxUses: 100, validFrom: "", validUntil: "" });
      api.getAdminPromos().then((data) => setPromos(Array.isArray(data) ? data : [])).catch(() => {});
    } catch {
      toast.error("Failed to create promo");
    }
  };

  const createCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject) {
      toast.error("Name and subject are required");
      return;
    }
    try {
      await api.createAdminCampaign(campaignForm);
      toast.success("Campaign created");
      setCampaignForm({ name: "", subject: "", template: "promotional", target: "all_users", scheduledDate: "" });
      api.getAdminCampaigns().then((data) => setCampaigns(Array.isArray(data) ? data : [])).catch(() => {});
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      await api.sendCampaign(id);
      toast.success("Campaign sent");
      api.getAdminCampaigns().then((data) => setCampaigns(Array.isArray(data) ? data : [])).catch(() => {});
    } catch {
      toast.error("Failed to send campaign");
    }
  };

  // ─── System Tab Handlers ────────────────────────────────

  const handleSupplierToggle = async (supplier: any) => {
    try {
      await api.updateAdminSupplier(supplier.id, { isActive: !supplier.isActive });
      toast.success(`${supplier.name} ${supplier.isActive ? "disabled" : "enabled"}`);
      loadSystemData();
    } catch {
      toast.error("Failed to update supplier");
    }
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setEditForm({
      baseUrl: supplier.baseUrl || "",
      markupPercentage: supplier.markupPercentage || 0,
      priority: supplier.priority || 0,
      isMock: supplier.isMock ?? false,
      rateLimit: supplier.rateLimit || 100,
      timeout: supplier.timeout || 30000,
    });
  };

  const handleSaveSupplier = async () => {
    if (!editingSupplier) return;
    try {
      await api.updateAdminSupplier(editingSupplier.id, editForm);
      toast.success("Supplier updated");
      setEditingSupplier(null);
      loadSystemData();
    } catch {
      toast.error("Failed to update supplier");
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const result = await api.testSupplierConnection(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Connection test failed");
    } finally {
      setTestingId(null);
    }
  };

  const handleConfigToggle = async (config: any) => {
    const newValue = config.value === "true" ? "false" : "true";
    setSavingConfig(config.key);
    try {
      await api.updateSystemConfig(config.key, newValue);
      toast.success("Setting saved");
      // Update local state
      setConfigs((prev) => prev.map((c) => c.key === config.key ? { ...c, value: newValue } : c));
    } catch {
      toast.error("Failed to save setting");
    } finally {
      setSavingConfig(null);
    }
  };

  const handleConfigValueChange = async (key: string, value: string) => {
    setSavingConfig(key);
    try {
      await api.updateSystemConfig(key, value);
      toast.success("Setting saved");
      setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, value } : c));
    } catch {
      toast.error("Failed to save setting");
    } finally {
      setSavingConfig(null);
    }
  };

  // ─── Derived config values ──────────────────────────────

  const featureFlags = useMemo(() => configs.filter((c) => c.category === "feature_flags"), [configs]);
  const globalConfigs = useMemo(() => configs.filter((c) => c.category === "global" || c.category === "currency"), [configs]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user || !isAdminRole(user.role)) return null;

  const tabs: Tab[] = isSuperAdmin(user.role)
    ? ["dashboard", "users", "promos", "campaigns", "system"]
    : ["dashboard", "users", "promos", "campaigns"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Total Users</h3>
              <p className="text-3xl font-bold mt-1">{stats?.totalUsers ?? "\u2014"}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-3xl font-bold mt-1">{stats?.totalBookings ?? "\u2014"}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Revenue</h3>
              <p className="text-3xl font-bold mt-1">
                {stats?.revenue != null
                  ? `$${Number(stats.revenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "\u2014"}
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Active Promos</h3>
              <p className="text-3xl font-bold mt-1">{stats?.activePromos ?? "\u2014"}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 font-medium text-gray-600">User Email</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No bookings found</td>
                    </tr>
                  )}
                  {recentBookings.map((b) => (
                    <tr key={b._id || b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{(b._id || b.id || "").slice(0, 8)}...</td>
                      <td className="px-4 py-3">{b.userEmail || b.user?.email || "\u2014"}</td>
                      <td className="px-4 py-3 capitalize">{b.productType || "\u2014"}</td>
                      <td className="px-4 py-3">${Number(b.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-800"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div>
            <label className="input-label">Search Users</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="input-field max-w-md"
              placeholder="Filter by name or email..."
            />
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Loyalty Points</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found</td>
                    </tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-800"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.loyaltyPoints ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROMOS TAB */}
      {activeTab === "promos" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Create Promo Code</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Code</label>
                <input type="text" value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} className="input-field" placeholder="SUMMER20" />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select value={promoForm.discountType} onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as "percentage" | "fixed" })} className="input-field">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="input-label">Value</label>
                <input type="number" value={promoForm.discountValue} onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Max Uses</label>
                <input type="number" value={promoForm.maxUses} onChange={(e) => setPromoForm({ ...promoForm, maxUses: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Valid From</label>
                <input type="date" value={promoForm.validFrom} onChange={(e) => setPromoForm({ ...promoForm, validFrom: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Valid Until</label>
                <input type="date" value={promoForm.validUntil} onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })} className="input-field" />
              </div>
            </div>
            <button onClick={createPromo} className="btn-primary mt-4">Create Promo Code</button>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">All Promo Codes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Code</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Discount</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Used / Max</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Valid From</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {promos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No promo codes found</td>
                    </tr>
                  )}
                  {promos.map((pr) => {
                    const isActive = pr.validUntil ? new Date(pr.validUntil) > new Date() : true;
                    return (
                      <tr key={pr._id || pr.id || pr.code} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium">{pr.code}</td>
                        <td className="px-4 py-3">{pr.discountType === "percentage" ? `${pr.discountValue}%` : `$${pr.discountValue}`}</td>
                        <td className="px-4 py-3">{pr.usedCount ?? 0} / {pr.maxUses ?? "\u221E"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{pr.validFrom ? new Date(pr.validFrom).toLocaleDateString() : "\u2014"}</td>
                        <td className="px-4 py-3 text-gray-500">{pr.validUntil ? new Date(pr.validUntil).toLocaleDateString() : "\u2014"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Create Campaign</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Name</label>
                <input type="text" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} className="input-field" placeholder="Spring Sale Campaign" />
              </div>
              <div>
                <label className="input-label">Subject</label>
                <input type="text" value={campaignForm.subject} onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })} className="input-field" placeholder="Check out our spring deals!" />
              </div>
              <div>
                <label className="input-label">Template</label>
                <select value={campaignForm.template} onChange={(e) => setCampaignForm({ ...campaignForm, template: e.target.value as CampaignForm["template"] })} className="input-field">
                  <option value="welcome">Welcome</option>
                  <option value="promotional">Promotional</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
              <div>
                <label className="input-label">Target Audience</label>
                <select value={campaignForm.target} onChange={(e) => setCampaignForm({ ...campaignForm, target: e.target.value as CampaignForm["target"] })} className="input-field">
                  <option value="all_users">All Users</option>
                  <option value="loyalty_members">Loyalty Members</option>
                  <option value="inactive_users">Inactive Users</option>
                </select>
              </div>
              <div>
                <label className="input-label">Scheduled Date</label>
                <input type="date" value={campaignForm.scheduledDate} onChange={(e) => setCampaignForm({ ...campaignForm, scheduledDate: e.target.value })} className="input-field" />
              </div>
            </div>
            <button onClick={createCampaign} className="btn-primary mt-4">Create Campaign</button>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">All Campaigns</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Template</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Target</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Created</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No campaigns found</td>
                    </tr>
                  )}
                  {campaigns.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "sent" ? "bg-green-100 text-green-800" : c.status === "sending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                          {c.status || "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">{c.template}</td>
                      <td className="px-4 py-3">{(c.target || "").replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "\u2014"}</td>
                      <td className="px-4 py-3">
                        {c.status !== "sent" && (
                          <button onClick={() => handleSendCampaign(c._id || c.id)} className="btn-secondary text-xs px-3 py-1">Send</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM TAB (Super Admin only) */}
      {activeTab === "system" && isSuperAdmin(user.role) && (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="flex gap-2">
            {(["suppliers", "features", "audit"] as SystemSubTab[]).map((st) => (
              <button
                key={st}
                onClick={() => setSystemSubTab(st)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  systemSubTab === st
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st === "suppliers" ? "Suppliers" : st === "features" ? "Feature Flags" : "Audit Log"}
              </button>
            ))}
          </div>

          {/* SUPPLIERS SUB-TAB */}
          {systemSubTab === "suppliers" && (
            <div className="space-y-4">
              <div className="card overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg">Supplier Adapters</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage supplier connections, toggle active status, and set markup percentages.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Code</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Mode</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Markup</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Priority</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {suppliers.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No suppliers found</td>
                        </tr>
                      )}
                      {suppliers.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{s.name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                          <td className="px-4 py-3 capitalize">{s.type?.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3">
                            <Toggle checked={s.isActive} onChange={() => handleSupplierToggle(s)} />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.isMock ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                            }`}>
                              {s.isMock ? "Mock" : "Live"}
                            </span>
                          </td>
                          <td className="px-4 py-3">{s.markupPercentage ?? 0}%</td>
                          <td className="px-4 py-3">{s.priority ?? 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditSupplier(s)}
                                className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleTestConnection(s.id)}
                                disabled={testingId === s.id}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50"
                              >
                                {testingId === s.id ? "Testing..." : "Test"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Supplier Modal */}
              {editingSupplier && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                    <h3 className="text-lg font-semibold mb-4">Edit: {editingSupplier.name}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="input-label">Base URL</label>
                        <input type="text" value={editForm.baseUrl} onChange={(e) => setEditForm({ ...editForm, baseUrl: e.target.value })} className="input-field" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Markup %</label>
                          <input type="number" min={0} max={100} step={0.1} value={editForm.markupPercentage} onChange={(e) => setEditForm({ ...editForm, markupPercentage: Number(e.target.value) })} className="input-field" />
                        </div>
                        <div>
                          <label className="input-label">Priority</label>
                          <input type="number" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })} className="input-field" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Rate Limit (req/min)</label>
                          <input type="number" min={1} value={editForm.rateLimit} onChange={(e) => setEditForm({ ...editForm, rateLimit: Number(e.target.value) })} className="input-field" />
                        </div>
                        <div>
                          <label className="input-label">Timeout (ms)</label>
                          <input type="number" min={1000} step={1000} value={editForm.timeout} onChange={(e) => setEditForm({ ...editForm, timeout: Number(e.target.value) })} className="input-field" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Toggle checked={editForm.isMock} onChange={(v) => setEditForm({ ...editForm, isMock: v })} />
                        <span className="text-sm text-gray-700">Mock Mode</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={() => setEditingSupplier(null)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                      <button onClick={handleSaveSupplier} className="btn-primary px-4 py-2 text-sm">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FEATURE FLAGS SUB-TAB */}
          {systemSubTab === "features" && (
            <div className="space-y-6">
              {/* Product Verticals */}
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-1">Product Verticals</h3>
                <p className="text-sm text-gray-500 mb-4">Enable or disable product types across the platform.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featureFlags
                    .filter((c) => c.key.startsWith("feature.") && !["feature.payments.enabled", "feature.promos.enabled"].includes(c.key))
                    .map((config) => (
                      <div key={config.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{config.label}</p>
                          <p className="text-xs text-gray-500">{config.key}</p>
                        </div>
                        <Toggle
                          checked={config.value === "true"}
                          onChange={() => handleConfigToggle(config)}
                          disabled={savingConfig === config.key}
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Platform Features */}
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-1">Platform Features</h3>
                <p className="text-sm text-gray-500 mb-4">Control platform-wide features and modes.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...featureFlags.filter((c) => ["feature.payments.enabled", "feature.promos.enabled"].includes(c.key)),
                    ...globalConfigs.filter((c) => c.type === "boolean"),
                  ].map((config) => (
                    <div key={config.key} className={`flex items-center justify-between p-4 rounded-lg ${
                      config.key === "global.maintenanceMode" && config.value === "true"
                        ? "bg-red-50 border border-red-200"
                        : "bg-gray-50"
                    }`}>
                      <div>
                        <p className="font-medium text-sm">{config.label}</p>
                        <p className="text-xs text-gray-500">{config.key}</p>
                      </div>
                      <Toggle
                        checked={config.value === "true"}
                        onChange={() => handleConfigToggle(config)}
                        disabled={savingConfig === config.key}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Settings */}
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-1">Global Settings</h3>
                <p className="text-sm text-gray-500 mb-4">Configure currencies, booking fees, and other global values.</p>
                <div className="space-y-4">
                  {globalConfigs
                    .filter((c) => c.type !== "boolean")
                    .map((config) => (
                      <div key={config.key} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{config.label}</p>
                            <p className="text-xs text-gray-500">{config.description}</p>
                          </div>
                        </div>
                        {config.type === "number" ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={config.value}
                              onChange={(e) => setConfigs((prev) => prev.map((c) => c.key === config.key ? { ...c, value: e.target.value } : c))}
                              className="input-field max-w-xs"
                            />
                            <button
                              onClick={() => handleConfigValueChange(config.key, config.value)}
                              disabled={savingConfig === config.key}
                              className="btn-primary text-xs px-3 py-2"
                            >
                              {savingConfig === config.key ? "Saving..." : "Save"}
                            </button>
                          </div>
                        ) : config.type === "json" ? (
                          <div className="flex gap-2 items-start">
                            <textarea
                              value={config.value}
                              onChange={(e) => setConfigs((prev) => prev.map((c) => c.key === config.key ? { ...c, value: e.target.value } : c))}
                              className="input-field max-w-md font-mono text-xs"
                              rows={2}
                            />
                            <button
                              onClick={() => handleConfigValueChange(config.key, config.value)}
                              disabled={savingConfig === config.key}
                              className="btn-primary text-xs px-3 py-2"
                            >
                              {savingConfig === config.key ? "Saving..." : "Save"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={config.value}
                              onChange={(e) => setConfigs((prev) => prev.map((c) => c.key === config.key ? { ...c, value: e.target.value } : c))}
                              className="input-field max-w-md"
                            />
                            <button
                              onClick={() => handleConfigValueChange(config.key, config.value)}
                              disabled={savingConfig === config.key}
                              className="btn-primary text-xs px-3 py-2"
                            >
                              {savingConfig === config.key ? "Saving..." : "Save"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOG SUB-TAB */}
          {systemSubTab === "audit" && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <select
                  value={auditFilter}
                  onChange={(e) => { setAuditFilter(e.target.value); setAuditPage(1); }}
                  className="input-field max-w-xs"
                >
                  <option value="">All Entity Types</option>
                  <option value="system_config">System Config</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Timestamp</th>
                        <th className="px-4 py-3 font-medium text-gray-600">User</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Entity Type</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Entity ID</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Changes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No audit logs found</td>
                        </tr>
                      )}
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : "\u2014"}
                          </td>
                          <td className="px-4 py-3 text-xs">{log.userEmail}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.entityType === "supplier" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                            }`}>
                              {log.entityType}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{(log.entityId || "").slice(0, 20)}</td>
                          <td className="px-4 py-3 capitalize text-xs">{log.action}</td>
                          <td className="px-4 py-3">
                            <details className="cursor-pointer">
                              <summary className="text-xs text-primary-600 hover:text-primary-800">View</summary>
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono max-w-sm overflow-auto">
                                {log.oldValue && (
                                  <div className="mb-1">
                                    <span className="text-red-600">Old:</span> {log.oldValue}
                                  </div>
                                )}
                                {log.newValue && (
                                  <div>
                                    <span className="text-green-600">New:</span> {log.newValue}
                                  </div>
                                )}
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {auditTotal > 20 && (
                  <div className="flex justify-between items-center p-4 border-t">
                    <span className="text-sm text-gray-500">
                      Page {auditPage} of {Math.ceil(auditTotal / 20)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage <= 1}
                        className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setAuditPage((p) => p + 1)}
                        disabled={auditPage >= Math.ceil(auditTotal / 20)}
                        className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
