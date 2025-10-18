"use client";

import { AddDebtorDialog } from './add-debtor-dialog';
import { PayDebtDialog } from './pay-debt-dialog';
import { Button } from './ui/button';
import { useAuthContext } from '@/context/auth-context';
import { Coins, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="py-6 flex items-center justify-between border-b-2 border-primary/20 mb-8">
        <div className="flex items-center gap-3">
            <Coins className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground tracking-tighter">
                DebtTracker
            </h1>
        </div>
      <div className="flex gap-2 items-center">
        <PayDebtDialog />
        <AddDebtorDialog />
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
