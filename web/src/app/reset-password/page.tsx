'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PageTransition } from '@/components/ui/PageTransition';
import { api } from '@/lib/api';
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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength', 'Password must be at least 8 characters'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsMismatch', 'Passwords do not match'));
      return;
    }

    if (!token) {
      toast.error(t('auth.invalidResetToken', 'Invalid or missing reset token'));
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-algerian relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-12 right-12 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white text-center max-w-md">
          <Logo variant="white" size="lg" className="mx-auto mb-8" />
          <h2 className="text-display-sm font-bold mb-4">
            {t('auth.newPasswordTitle', 'Create New Password')}
          </h2>
          <p className="text-white/80 text-body-md">
            {t('auth.newPasswordBranding', 'Choose a strong password to keep your account secure.')}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <PageTransition className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" className="mx-auto mb-4" />
          </div>

          {success ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h1 className="text-display-sm font-bold text-gray-900 mb-2">
                {t('auth.passwordResetSuccess', 'Password Reset Successfully')}
              </h1>
              <p className="text-gray-500 mb-8">
                {t('auth.passwordResetSuccessMsg', 'Your password has been updated. You can now sign in with your new password.')}
              </p>
              <Link href="/login" className="btn-primary w-full inline-flex items-center justify-center">
                {t('auth.signIn')}
              </Link>
            </div>
          ) : !token ? (
            /* No token state */
            <div className="text-center">
              <h1 className="text-display-sm font-bold text-gray-900 mb-2">
                {t('auth.invalidLink', 'Invalid Reset Link')}
              </h1>
              <p className="text-gray-500 mb-8">
                {t('auth.invalidLinkMsg', 'This password reset link is invalid or has expired. Please request a new one.')}
              </p>
              <div className="space-y-3">
                <Link href="/forgot-password" className="btn-primary w-full inline-flex items-center justify-center">
                  {t('auth.requestNewLink', 'Request New Link')}
                </Link>
                <Link href="/login" className="btn-ghost w-full inline-flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.backToLogin', 'Back to Login')}
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <h1 className="text-display-sm font-bold text-gray-900 mb-2">
                {t('auth.newPasswordTitle', 'Create New Password')}
              </h1>
              <p className="text-gray-500 mb-8">
                {t('auth.newPasswordSubtitle', 'Enter your new password below. Make sure it\'s at least 8 characters.')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="input-label">{t('auth.newPassword', 'New Password')}</label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="input-field ps-11 pe-11"
                      placeholder="Min 8 characters"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <label className="input-label">{t('auth.confirmPassword', 'Confirm Password')}</label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="input-field ps-11 pe-11"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-error-600 mt-1">
                      {t('auth.passwordsMismatch', 'Passwords do not match')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('auth.resetPasswordBtn', 'Reset Password')
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('auth.backToLogin', 'Back to Login')}
                </Link>
              </p>
            </>
          )}
        </PageTransition>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
