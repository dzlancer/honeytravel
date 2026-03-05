'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';

export function Providers({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
      <Toaster position="top-right" />
    </AuthContext.Provider>
  );
}
