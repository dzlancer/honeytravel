'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Coins, ArrowRightLeft, Infinity, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageTransition } from '@/components/ui/PageTransition';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import clsx from 'clsx';

const TIERS = [
  { name: 'bronze', min: 0 },
  { name: 'silver', min: 5000 },
  { name: 'gold', min: 20000 },
  { name: 'platinum', min: 50000 },
];

export default function LoyaltyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any>({ transactions: [], total: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.getLoyaltyBalance().then(setBalance);
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    api.getLoyaltyHistory(page).then(setHistory);
  }, [user, page]);

  if (!balance) {
    return (
      <div className="section py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton variant="text" width="200px" height="28px" />
          <Skeleton variant="card" height="200px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="300px" />
        </div>
      </div>
    );
  }

  const points = balance.balance || 0;
  const currentTier = TIERS.slice().reverse().find((tier) => points >= tier.min) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const progress = nextTier ? Math.min(((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100) : 100;
  const totalPages = Math.ceil((history.total || 0) / 10);

  const features = [
    { icon: Coins, title: t('loyalty.earnPoints'), desc: t('loyalty.earnPointsDesc'), color: 'bg-primary-100 text-primary-600' },
    { icon: ArrowRightLeft, title: t('loyalty.redeemRewards'), desc: t('loyalty.redeemRewardsDesc'), color: 'bg-accent-100 text-accent-600' },
    { icon: Infinity, title: t('loyalty.neverExpire'), desc: t('loyalty.neverExpireDesc'), color: 'bg-success-100 text-success-600' },
  ];

  return (
    <PageTransition>
      <div className="section py-8">
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs items={[
            { label: t('common.home'), href: '/' },
            { label: t('loyalty.title') },
          ]} />

          <h1 className="text-display-sm font-bold text-gray-900 mb-8">{t('loyalty.title')}</h1>

          {/* Points Card */}
          <div className="card overflow-hidden mb-8">
            <div className="bg-gradient-algerian p-8 text-white relative">
              <div className="absolute top-4 end-4 opacity-30">
                <Sparkles className="w-8 h-8 text-accent-300" />
              </div>
              <p className="text-white/70 text-sm mb-1">{t('loyalty.yourBalance')}</p>
              <div className="text-5xl font-bold mb-2">{points.toLocaleString()}</div>
              <p className="text-white/70">
                {t('loyalty.worth')} <span className="text-accent-300 font-semibold">${balance.valueUsd?.toFixed(2)}</span>
              </p>
            </div>

            {/* Tier Progress */}
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{t('loyalty.tierProgress')}</span>
                <span className="badge badge-primary capitalize">{t(`loyalty.${currentTier.name}`)}</span>
              </div>
              <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 start-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                {TIERS.map((tier) => (
                  <span key={tier.name} className={clsx(points >= tier.min && 'text-primary-600 font-medium')}>
                    {t(`loyalty.${tier.name}`)}
                  </span>
                ))}
              </div>
              {nextTier && (
                <p className="text-xs text-gray-500 mt-3">
                  {(nextTier.min - points).toLocaleString()} {t('loyalty.points')} to {t(`loyalty.${nextTier.name}`)}
                </p>
              )}
            </div>
          </div>

          {/* How it Works */}
          <div className="mb-8">
            <h2 className="text-heading-md font-semibold text-gray-900 mb-4">{t('loyalty.howItWorks')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div key={i} className="card p-5 text-center">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3', f.color)}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-heading-md font-semibold text-gray-900">{t('loyalty.history')}</h2>
            </div>

            {history.transactions.length === 0 ? (
              <EmptyState
                icon={Coins}
                title={t('loyalty.noTransactions')}
                description={t('loyalty.noTransactionsDesc')}
                action={{ label: t('booking.startExploring'), href: '/search' }}
              />
            ) : (
              <div>
                <div className="divide-y divide-gray-50">
                  {history.transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          tx.points > 0 ? 'bg-success-100' : 'bg-error-100'
                        )}>
                          {tx.points > 0 ? (
                            <TrendingUp className="w-4 h-4 text-success-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-error-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={clsx(
                        'font-semibold text-sm',
                        tx.points > 0 ? 'text-success-600' : 'text-error-600'
                      )}>
                        {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-100">
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
