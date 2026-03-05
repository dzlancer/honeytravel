'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { User, Phone, Globe, Coins, Edit3, Save, X, Award } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
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
      toast.success(t('profile.saveChanges'));
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  if (!profile) {
    return (
      <div className="section py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex gap-2">
            <Skeleton variant="text" width="60px" />
            <Skeleton variant="text" width="80px" />
          </div>
          <Skeleton variant="text" height="32px" width="200px" />
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton variant="avatar" width="80px" height="80px" />
              <div className="space-y-2">
                <Skeleton variant="text" width="160px" height="24px" />
                <Skeleton variant="text" width="200px" />
              </div>
            </div>
            <Skeleton variant="text" count={4} className="mb-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="section py-8">
        <div className="max-w-2xl mx-auto">
          <Breadcrumbs items={[
            { label: t('common.home'), href: '/' },
            { label: t('profile.title') },
          ]} />

          <h1 className="text-display-sm font-bold text-gray-900 mb-8">{t('profile.title')}</h1>

          {/* Profile Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center ring-4 ring-primary-100">
                  <span className="text-white font-bold text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                  <p className="text-gray-500 text-sm">{profile.email}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {t('profile.memberSince')} {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-ghost btn-sm">
                  <Edit3 className="w-4 h-4" />
                  {t('profile.editProfile')}
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      {t('profile.personalInfo')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">{t('auth.firstName')}</label>
                        <div className="relative">
                          <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field ps-10" />
                        </div>
                      </div>
                      <div>
                        <label className="input-label">{t('auth.lastName')}</label>
                        <div className="relative">
                          <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field ps-10" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">{t('profile.phone')}</label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field ps-10" placeholder="+213..." />
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider pt-2">
                      {t('profile.preferences')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">{t('common.currency')}</label>
                        <div className="relative">
                          <Coins className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select value={form.preferredCurrency} onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })} className="input-field ps-10">
                            {['USD', 'EUR', 'GBP', 'DZD'].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="input-label">{t('common.language')}</label>
                        <div className="relative">
                          <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })} className="input-field ps-10">
                            <option value="en">English</option>
                            <option value="fr">Fran&ccedil;ais</option>
                            <option value="ar">العربية</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSave} className="btn-primary btn-sm">
                        <Save className="w-4 h-4" />
                        {t('profile.saveChanges')}
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-ghost btn-sm">
                        <X className="w-4 h-4" />
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{t('profile.phone')}:</span>
                        <span className="font-medium">{profile.phone || t('profile.notSet')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{t('common.currency')}:</span>
                        <span className="font-medium">{profile.preferredCurrency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{t('common.language')}:</span>
                        <span className="font-medium">{profile.preferredLanguage === 'fr' ? 'Fran\u00e7ais' : profile.preferredLanguage === 'ar' ? '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' : 'English'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loyalty Summary */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-algerian p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-accent-300" />
                    <h3 className="font-semibold">{t('profile.loyaltySummary')}</h3>
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {(profile.loyaltyPoints || 0).toLocaleString()}
                    <span className="text-sm font-normal text-white/70 ms-2">{t('loyalty.points')}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">
                    {t('loyalty.worth')} ${((profile.loyaltyPoints || 0) * 0.01).toFixed(2)}
                  </p>
                </div>
                <Link href="/loyalty" className="btn btn-sm bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                  {t('profile.viewDetails')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
