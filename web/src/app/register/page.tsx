'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PageTransition } from '@/components/ui/PageTransition';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 8 ? 1 : len < 12 ? 2 : 3;
  const colors = ['bg-gray-200', 'bg-error-500', 'bg-warning-500', 'bg-success-500'];
  const labels = ['', 'Weak', 'Good', 'Strong'];

  if (len === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={clsx(
              'h-1 flex-1 rounded-full transition-colors',
              strength >= level ? colors[strength] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <p className={clsx('text-xs mt-1', strength === 1 ? 'text-error-600' : strength === 2 ? 'text-warning-600' : 'text-success-600')}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success(t('auth.registerTitle'));
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-algerian relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-12 left-12 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white text-center max-w-md">
          <Logo variant="white" size="lg" className="mx-auto mb-8" />
          <h2 className="text-display-sm font-bold mb-4">
            {t('auth.registerSubtitle')}
          </h2>
          <p className="text-white/80 text-body-md">
            {t('home.heroSub')}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
        <PageTransition className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" className="mx-auto mb-4" />
          </div>

          <h1 className="text-display-sm font-bold text-gray-900 mb-2">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-gray-500 mb-8">
            {t('auth.registerSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">{t('auth.firstName')}</label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="input-field ps-11"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">{t('auth.lastName')}</label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="input-field ps-11"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input-field ps-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="input-label">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="input-field ps-11 pe-11"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                {t('auth.termsAgree')}{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">{t('auth.terms')}</Link>
                {' '}{t('auth.and')}{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">{t('auth.privacy')}</Link>
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signUp')
              )}
            </button>
          </form>

          {/* Social login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-sand-50 text-gray-500">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button type="button" className="btn-ghost border border-gray-200 text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button type="button" className="btn-ghost border border-gray-200 text-sm">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            {t('auth.hasAccount')}{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t('auth.signIn')}
            </Link>
          </p>
        </PageTransition>
      </div>
    </div>
  );
}
