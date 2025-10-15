"use client";

import type { ReactNode } from 'react';
import { DebtorsProvider } from '@/context/debtors-context';
import { AuthProvider } from '@/context/auth-context';
import { MotionConfig } from 'framer-motion';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <DebtorsProvider>{children}</DebtorsProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
