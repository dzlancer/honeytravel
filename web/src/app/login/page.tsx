'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PageTransition } from '@/components/ui/PageTransition';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('auth.loginTitle'));
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* Left branded panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-algerian relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-12 right-12 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white text-center max-w-md">
          <Logo variant="white" size="lg" className="mx-auto mb-8" />
          <h2 className="text-display-sm font-bold mb-4">
            {t('common.tagline')}
          </h2>
          <p className="text-white/80 text-body-md">
            {t('auth.loginSubtitle')}
          </p>
          <div className="flex justify-center gap-8 mt-12 text-sm text-white/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div>{t('common.hotels')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div>{t('common.guests')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.8</div>
              <div>{t('common.rating')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <PageTransition className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" className="mx-auto mb-4" />
          </div>

          <h1 className="text-display-sm font-bold text-gray-900 mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-500 mb-8">
            {t('auth.loginSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field ps-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label !mb-0">{t('auth.password')}</label>
                <Link href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field ps-11 pe-11"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signIn')
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
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t('auth.signUp')}
            </Link>
          </p>
        </PageTransition>
      </div>
    </div>
  );
}
