'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import clsx from 'clsx';

const NAV_LINKS = [
  { key: 'hotels', href: '/search' },
  { key: 'flights', href: '/search?type=flight' },
  { key: 'packages', href: '/search?type=package' },
  { key: 'carRentals', href: '/search?type=car' },
] as const;

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft-sm border-b border-gray-100'
            : 'bg-white'
        )}
      >
        <div className="section">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600
                    rounded-lg hover:bg-primary-50/50 transition-colors"
                >
                  {t(`common.${link.key}`)}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSwitcher />

              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
                      hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700
                      rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-xs">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                    <svg className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', profileOpen && 'rotate-180')}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-56
                      bg-white rounded-xl shadow-soft-lg border border-gray-100 overflow-hidden
                      animate-fade-in-down z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {[
                          { href: '/profile', label: t('common.profile'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                          { href: '/bookings', label: t('common.myBookings'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                          { href: '/loyalty', label: 'Loyalty Points', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
                        ].map((item) => (
                          <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.label}
                          </Link>
                        ))}
                        {user.role === 'admin' && (
                          <Link href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error-600 hover:bg-error-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t('common.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn-ghost btn-sm text-sm">
                    {t('common.login')}
                  </Link>
                  <Link href="/register" className="btn-primary btn-sm text-sm">
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 w-80 max-w-[85vw]
            bg-white z-50 lg:hidden animate-slide-in-right shadow-soft-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                <Logo size="sm" />
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-3">
                {NAV_LINKS.map((link) => (
                  <Link key={link.key} href={link.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700
                      hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    {t(`common.${link.key}`)}
                  </Link>
                ))}
                <div className="my-3 border-t border-gray-100" />
                {user ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      {t('common.profile')}
                    </Link>
                    <Link href="/bookings" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                      {t('common.myBookings')}
                    </Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-error-600 hover:bg-error-50 mt-2">
                      {t('common.logout')}
                    </button>
                  </>
                ) : (
                  <div className="px-3 space-y-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center">
                      {t('common.login')}
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center">
                      {t('common.register')}
                    </Link>
                  </div>
                )}
              </nav>
              <div className="border-t border-gray-100 p-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
