"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type Tab = "dashboard" | "users" | "promos" | "campaigns";

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
  customer: "bg-blue-100 text-blue-800",
  supplier_manager: "bg-orange-100 text-orange-800",
};

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
  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    if (activeTab === "dashboard") {
      api.getAdminStats().then(setStats).catch(() => toast.error("Failed to load stats"));
      api.getAdminBookings(10).then((data) => {
        setRecentBookings(Array.isArray(data) ? data : data.bookings || []);
      }).catch(() => {});
    } else if (activeTab === "users") {
      api.getAdminUsers().then((data) => {
        setUsers(Array.isArray(data) ? data : data.users || []);
      }).catch(() => toast.error("Failed to load users"));
    } else if (activeTab === "promos") {
      api.getAdminPromos().then((data) => {
        setPromos(Array.isArray(data) ? data : data.promos || []);
      }).catch(() => toast.error("Failed to load promos"));
    } else if (activeTab === "campaigns") {
      api.getAdminCampaigns().then((data) => {
        setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
      }).catch(() => toast.error("Failed to load campaigns"));
    }
  }, [activeTab, user]);

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
      api.getAdminPromos().then((data) => setPromos(Array.isArray(data) ? data : data.promos || [])).catch(() => {});
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
      api.getAdminCampaigns().then((data) => setCampaigns(Array.isArray(data) ? data : data.campaigns || [])).catch(() => {});
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      await api.sendCampaign(id);
      toast.success("Campaign sent");
      api.getAdminCampaigns().then((data) => setCampaigns(Array.isArray(data) ? data : data.campaigns || [])).catch(() => {});
    } catch {
      toast.error("Failed to send campaign");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const tabs: Tab[] = ["dashboard", "users", "promos", "campaigns"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
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
              <p className="text-3xl font-bold mt-1">{stats?.totalUsers ?? "—"}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-3xl font-bold mt-1">{stats?.totalBookings ?? "—"}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Revenue</h3>
              <p className="text-3xl font-bold mt-1">
                {stats?.revenue != null
                  ? `${"$"}${Number(stats.revenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"}
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-gray-500 text-sm">Active Promos</h3>
              <p className="text-3xl font-bold mt-1">{stats?.activePromos ?? "—"}</p>
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
                      <td className="px-4 py-3">{b.userEmail || b.user?.email || "—"}</td>
                      <td className="px-4 py-3 capitalize">{b.productType || "—"}</td>
                      <td className="px-4 py-3">{"$"}{Number(b.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-800"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
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
                      <td className="px-4 py-3 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
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
                        <td className="px-4 py-3">{pr.usedCount ?? 0} / {pr.maxUses ?? "∞"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{pr.validFrom ? new Date(pr.validFrom).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{pr.validUntil ? new Date(pr.validUntil).toLocaleDateString() : "—"}</td>
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
                      <td className="px-4 py-3 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
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
    </div>
  );
}
