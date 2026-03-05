'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'promos' | 'campaigns'>('dashboard');
  const [promoForm, setPromoForm] = useState({
    code: '', discountType: 'percentage' as const, discountValue: 10,
    maxUses: 100, validFrom: '', validUntil: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    // Fetch dashboard stats using the fetcher
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  const createPromo = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/promos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify(promoForm),
      });
      toast.success('Promo code created');
      setPromoForm({ code: '', discountType: 'percentage', discountValue: 10, maxUses: 100, validFrom: '', validUntil: '' });
    } catch {
      toast.error('Failed to create promo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {(['dashboard', 'promos', 'campaigns'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-gray-500 text-sm">Total Bookings</h3>
            <p className="text-3xl font-bold">{stats.totalBookings}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-gray-500 text-sm">Revenue</h3>
            <p className="text-3xl font-bold">${stats.revenue?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {activeTab === 'promos' && (
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Create Promo Code</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={promoForm.code}
                onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                className="input-field"
                placeholder="SUMMER20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={promoForm.discountType}
                onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as 'percentage' | 'fixed' })}
                className="input-field"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="number"
                value={promoForm.discountValue}
                onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input
                type="number"
                value={promoForm.maxUses}
                onChange={(e) => setPromoForm({ ...promoForm, maxUses: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input type="date" value={promoForm.validFrom} onChange={(e) => setPromoForm({ ...promoForm, validFrom: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input type="date" value={promoForm.validUntil} onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })} className="input-field" />
            </div>
          </div>
          <button onClick={createPromo} className="btn-primary mt-4">Create Promo Code</button>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Email Campaigns</h2>
          <p className="text-gray-500">Campaign management interface — create, schedule, and send marketing emails.</p>
        </div>
      )}
    </div>
  );
}
