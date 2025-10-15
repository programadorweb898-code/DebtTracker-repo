"use client";

import { AddDebtorDialog } from './add-debtor-dialog';
import { PayDebtDialog } from './pay-debt-dialog';
import { Coins } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 flex items-center justify-between border-b-2 border-primary/20 mb-8">
        <div className="flex items-center gap-3">
            <Coins className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground tracking-tighter">
                DebtTracker
            </h1>
        </div>
      <div className="flex gap-2">
        <PayDebtDialog />
        <AddDebtorDialog />
      </div>
    </header>
  );
}
