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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-32 flex items-center justify-between">
        {/* Elemento Izquierdo */}
        <div className="w-1/3 flex justify-start">
          <div className="flex items-center gap-3">
            <Coins className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
          </div>
        </div>

        {/* Elementos Centrados */}
        <div className="w-1/3 flex flex-col items-center gap-2">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground tracking-tighter">
              DebtTracker
          </h1>
          <div className="flex justify-center gap-2 items-center">
              <PayDebtDialog />
              <AddDebtorDialog />
          </div>
        </div>

        {/* Elemento Derecho */}
        <div className="w-1/3 flex justify-end">
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
