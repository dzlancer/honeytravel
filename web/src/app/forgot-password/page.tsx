'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PageTransition } from '@/components/ui/PageTransition';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-algerian relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-12 left-12 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white text-center max-w-md">
          <Logo variant="white" size="lg" className="mx-auto mb-8" />
          <h2 className="text-display-sm font-bold mb-4">
            {t('auth.forgotPasswordTitle', 'Reset Your Password')}
          </h2>
          <p className="text-white/80 text-body-md">
            {t('auth.forgotPasswordBranding', "Don't worry, it happens! We'll help you get back into your account.")}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <PageTransition className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" className="mx-auto mb-4" />
          </div>

          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h1 className="text-display-sm font-bold text-gray-900 mb-2">
                {t('auth.checkYourEmail', 'Check Your Email')}
              </h1>
              <p className="text-gray-500 mb-4">
                {t('auth.resetEmailSent', 'If an account exists for')} <span className="font-medium text-gray-700">{email}</span>
                {t('auth.resetEmailSentSuffix', ', you will receive a password reset link shortly.')}
              </p>
              <p className="text-sm text-gray-400 mb-8">
                {t('auth.checkSpam', "Didn't receive the email? Check your spam folder or try again.")}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setSent(false)}
                  className="btn-primary w-full"
                >
                  {t('auth.tryAgainEmail', 'Try Another Email')}
                </button>
                <Link href="/login" className="btn-ghost w-full inline-flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.backToLogin', 'Back to Login')}
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin', 'Back to Login')}
              </Link>

              <h1 className="text-display-sm font-bold text-gray-900 mb-2">
                {t('auth.forgotPasswordTitle', 'Reset Your Password')}
              </h1>
              <p className="text-gray-500 mb-8">
                {t('auth.forgotPasswordSubtitle', 'Enter the email address associated with your account and we\'ll send you a link to reset your password.')}
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
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('auth.sendResetLink', 'Send Reset Link')
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                {t('auth.rememberPassword', 'Remember your password?')}{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  {t('auth.signIn')}
                </Link>
              </p>
            </>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
