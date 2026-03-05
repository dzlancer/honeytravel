'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function LoyaltyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any>({ transactions: [], total: 0 });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.getLoyaltyBalance().then(setBalance);
    api.getLoyaltyHistory().then(setHistory);
  }, [user, router]);

  if (!balance) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Loyalty Program</h1>

      <div className="card p-6 mb-6 text-center">
        <p className="text-gray-500 mb-2">Your Points Balance</p>
        <p className="text-5xl font-bold text-primary-700">{balance.balance?.toLocaleString()}</p>
        <p className="text-gray-500 mt-2">Worth ${balance.valueUsd?.toFixed(2)}</p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-lg mb-2">How it works</h2>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-primary-600">10</div>
            <p className="text-gray-500">points per $1 spent</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">100</div>
            <p className="text-gray-500">points = $1 discount</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">0</div>
            <p className="text-gray-500">expiration</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Transaction History</h2>
        {history.transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {history.transactions.map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
