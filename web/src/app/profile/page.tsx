'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', preferredCurrency: 'USD', preferredLanguage: 'en' });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.getProfile().then((p) => {
      setProfile(p);
      setForm({ firstName: p.firstName, lastName: p.lastName, phone: p.phone || '', preferredCurrency: p.preferredCurrency, preferredLanguage: p.preferredLanguage });
    });
  }, [user, router]);

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  if (!profile) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-bold text-xl">
              {profile.firstName[0]}{profile.lastName[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.preferredCurrency} onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })} className="input-field">
                  {['USD', 'EUR', 'GBP', 'DZD'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })} className="input-field">
                  <option value="en">English</option>
                  <option value="fr">Fran&ccedil;ais</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-gray-500">Phone:</span> {profile.phone || 'Not set'}</div>
              <div><span className="text-gray-500">Currency:</span> {profile.preferredCurrency}</div>
              <div><span className="text-gray-500">Language:</span> {profile.preferredLanguage}</div>
              <div><span className="text-gray-500">Member since:</span> {new Date(profile.createdAt).toLocaleDateString()}</div>
            </div>
            <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-3">Loyalty Points</h2>
        <div className="text-3xl font-bold text-primary-700">{profile.loyaltyPoints?.toLocaleString() || 0}</div>
        <p className="text-gray-500 text-sm">points available (${((profile.loyaltyPoints || 0) * 0.01).toFixed(2)} value)</p>
      </div>
    </div>
  );
}
