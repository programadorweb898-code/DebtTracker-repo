"use client";

import type { ReactNode } from 'react';
import { DebtorsProvider } from '@/context/debtors-context';
import { AuthProvider } from '@/context/auth-context';
import { MotionConfig } from 'framer-motion';
import { FirebaseClientProvider } from '@/firebase';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <FirebaseClientProvider>
        <AuthProvider>
          <DebtorsProvider>{children}</DebtorsProvider>
        </AuthProvider>
      </FirebaseClientProvider>
    </MotionConfig>
  );
}