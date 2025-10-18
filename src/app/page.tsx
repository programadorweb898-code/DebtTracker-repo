"use client";

import { useAuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DebtorsDashboard } from '@/components/debtors-dashboard';

export default function Home() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-foreground">Cargando...</div>
        </div>
    );
  }

  return <DebtorsDashboard />;
}
