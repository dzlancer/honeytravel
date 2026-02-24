import { useEffect, useState } from "react";
import { BarChart3, Users, Hotel, CreditCard, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Lang, t, formatPrice } from "../lib/i18n";

interface Props { lang: Lang; }

type Tab = "dashboard" | "bookings" | "customers" | "pricing";

export default function AdminPage({ lang }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pricing
  const [pricingDistrict, setPricingDistrict] = useState("");
  const [pricingAdjustment, setPricingAdjustment] = useState(0);
  const [pricingResult, setPricingResult] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const data = await api.getDashboard();
        setDashboard(data);
      } else if (tab === "bookings") {
        const data = await api.getBookings({ limit: 50 });
        setBookings(data.bookings);
      } else if (tab === "customers") {
        const data = await api.getCustomers({ limit: 50 });
        setCustomers(data.customers);
      }
    } catch {}
    setLoading(false);
  };

  const handlePricingUpdate = async () => {
    try {
      const data: any = { adjustment_pct: pricingAdjustment };
      if (pricingDistrict) data.district = pricingDistrict;
      const result = await api.bulkPricingUpdate(data);
      setPricingResult(`Updated ${result.variants_updated} variants and ${result.hotels_updated} hotels (${pricingAdjustment > 0 ? "+" : ""}${pricingAdjustment}%)`);
    } catch (err: any) {
      setPricingResult("Error: " + (err.message || "Failed"));
    }
  };

  const updateBookingStatus = async (ref: string, status: string) => {
    try {
      await api.updateBookingStatus(ref, { status });
      loadData();
    } catch {}
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: t("admin.dashboard", lang), icon: <BarChart3 size={18} /> },
    { id: "bookings", label: t("admin.bookings", lang), icon: <CreditCard size={18} /> },
    { id: "customers", label: t("admin.customers", lang), icon: <Users size={18} /> },
    { id: "pricing", label: t("admin.pricing", lang), icon: <TrendingUp size={18} /> },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    no_show: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === tb.id
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {tb.icon}
              {tb.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {tab === "dashboard" && dashboard && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: lang === "fr" ? "Hotels Actifs" : "Active Hotels", value: dashboard.active_hotels, icon: <Hotel size={20} />, color: "bg-blue-50 text-blue-600" },
                    { label: lang === "fr" ? "Total Reservations" : "Total Bookings", value: dashboard.total_bookings, icon: <CreditCard size={20} />, color: "bg-green-50 text-green-600" },
                    { label: lang === "fr" ? "Clients" : "Customers", value: dashboard.total_customers, icon: <Users size={20} />, color: "bg-purple-50 text-purple-600" },
                    { label: lang === "fr" ? "Revenu Total" : "Total Revenue", value: formatPrice(dashboard.total_revenue_dzd), icon: <TrendingUp size={20} />, color: "bg-amber-50 text-amber-600" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue by Channel */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {lang === "fr" ? "Revenu par Canal" : "Revenue by Channel"}
                    </h3>
                    {dashboard.revenue_by_channel?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboard.revenue_by_channel.map((ch: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-amber-400" />
                              <span className="text-sm text-gray-700 capitalize">{ch.channel}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">{ch.bookings} {lang === "fr" ? "reservations" : "bookings"}</span>
                              <span className="text-xs text-gray-400 ml-2">{formatPrice(ch.revenue || 0)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">{lang === "fr" ? "Aucune donnee" : "No data yet"}</p>
                    )}
                  </div>

                  {/* Bookings by Status */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {lang === "fr" ? "Reservations par Statut" : "Bookings by Status"}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(dashboard.bookings_by_status || {}).map(([status, count]: any) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
                            {status}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{count}</span>
                        </div>
                      ))}
                      {Object.keys(dashboard.bookings_by_status || {}).length === 0 && (
                        <p className="text-sm text-gray-400">{lang === "fr" ? "Aucune reservation" : "No bookings yet"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AOV + Pending */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border">
                    <p className="text-xs text-gray-500">AOV ({lang === "fr" ? "Panier Moyen" : "Avg Order Value"})</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(dashboard.avg_order_value || 0)}</p>
                    <p className="text-xs text-gray-400 mt-1">{lang === "fr" ? "Objectif: 45,000 DZD" : "Target: 45,000 DZD"}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border">
                    <p className="text-xs text-gray-500">{lang === "fr" ? "En attente" : "Pending"}</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">{dashboard.pending_bookings}</p>
                    <p className="text-xs text-gray-400 mt-1">{lang === "fr" ? "A confirmer" : "To confirm"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {tab === "bookings" && (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ref</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hotel</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Check-in</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Nuits" : "Nights"}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Montant" : "Amount"}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.length > 0 ? bookings.map((b: any) => (
                        <tr key={b.booking_ref} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-medium">{b.booking_ref}</td>
                          <td className="px-4 py-3">{b.hotel_id}</td>
                          <td className="px-4 py-3 text-xs">{b.check_in?.split("T")[0]}</td>
                          <td className="px-4 py-3">{b.nights}N</td>
                          <td className="px-4 py-3 font-medium">{formatPrice(b.final_price_dzd)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[b.status] || ""}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {b.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateBookingStatus(b.booking_ref, "confirmed")}
                                    className="text-green-600 hover:text-green-700 p-1"
                                    title="Confirm"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(b.booking_ref, "cancelled")}
                                    className="text-red-500 hover:text-red-600 p-1"
                                    title="Cancel"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                            {lang === "fr" ? "Aucune reservation" : "No bookings yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {tab === "customers" && (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Nom" : "Name"}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Ville" : "City"}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Reservations" : "Bookings"}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Code Parrainage" : "Referral"}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{lang === "fr" ? "Inscrit le" : "Joined"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customers.length > 0 ? customers.map((c: any) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{c.full_name || "-"}</td>
                          <td className="px-4 py-3 text-xs font-mono">{c.whatsapp_phone}</td>
                          <td className="px-4 py-3">{c.city || "-"}</td>
                          <td className="px-4 py-3">{c.total_bookings}</td>
                          <td className="px-4 py-3 font-mono text-xs">{c.referral_code || "-"}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{c.created_at?.split("T")[0]}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                            {lang === "fr" ? "Aucun client" : "No customers yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {tab === "pricing" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border max-w-lg">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {lang === "fr" ? "Mise a jour des prix en masse" : "Bulk Pricing Update"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {lang === "fr" ? "Quartier (optionnel)" : "District (optional)"}
                    </label>
                    <select
                      value={pricingDistrict}
                      onChange={(e) => setPricingDistrict(e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      <option value="">{lang === "fr" ? "Tous les quartiers" : "All districts"}</option>
                      {["Laleli", "Fatih", "Sultanahmet", "Taksim", "Beyoglu", "Sisli", "Aksaray", "Besiktas"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {lang === "fr" ? "Ajustement (%)" : "Adjustment (%)"}
                    </label>
                    <input
                      type="number"
                      value={pricingAdjustment}
                      onChange={(e) => setPricingAdjustment(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 10 for +10%, -5 for -5%"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === "fr" ? "Positif = augmentation, Negatif = reduction" : "Positive = increase, Negative = decrease"}
                    </p>
                  </div>
                  <button
                    onClick={handlePricingUpdate}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    {lang === "fr" ? "Appliquer" : "Apply"}
                  </button>
                  {pricingResult && (
                    <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl">
                      {pricingResult}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
