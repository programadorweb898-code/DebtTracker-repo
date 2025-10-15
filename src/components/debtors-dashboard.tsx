"use client";

import { useState, useMemo } from 'react';
import type { Debtor } from '@/lib/types';
import { useDebtors } from '@/context/debtors-context';
import { AppHeader } from '@/components/app-header';
import { StatsCards } from '@/components/stats-cards';
import { DebtorFilters } from '@/components/debtor-filters';
import { DebtorList } from '@/components/debtor-list';
import { AnimatePresence, motion } from 'framer-motion';

type SortOption = 'alias-asc' | 'debt-asc' | 'debt-desc';

export function DebtorsDashboard() {
  const { debtors, isLoading } = useDebtors();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('debt-desc');
  const [debtRange, setDebtRange] = useState<[number, number]>([0, Infinity]);

  const filteredAndSortedDebtors = useMemo(() => {
    let filtered = debtors;

    if (searchTerm) {
      filtered = filtered.filter((d) =>
        d.alias.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const [minDebt, maxDebt] = debtRange;
    filtered = filtered.filter((d) => {
      const totalDebt = d.debts.reduce((sum, debt) => sum + debt.amount, 0);
      const isAfterMin = minDebt > 0 ? totalDebt >= minDebt : true;
      const isBeforeMax = maxDebt !== Infinity ? totalDebt <= maxDebt : true;
      return isAfterMin && isBeforeMax;
    });

    return [...filtered].sort((a, b) => {
      const totalDebtA = a.debts.reduce((sum, debt) => sum + debt.amount, 0);
      const totalDebtB = b.debts.reduce((sum, debt) => sum + debt.amount, 0);

      switch (sortOption) {
        case 'debt-asc':
          return totalDebtA - totalDebtB;
        case 'debt-desc':
          return totalDebtB - totalDebtA;
        case 'alias-asc':
          return a.alias.localeCompare(b.alias);
        default:
          return 0;
      }
    });
  }, [debtors, searchTerm, sortOption, debtRange]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        <AppHeader />
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <StatsCards />
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <DebtorFilters
              onSearch={setSearchTerm}
              onSort={setSortOption as (value: string) => void}
              onRangeChange={setDebtRange}
              debtorCount={filteredAndSortedDebtors.length}
            />
        </motion.div>
        
        <AnimatePresence>
            <motion.div
                key={filteredAndSortedDebtors.length}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="pb-12"
            >
                <DebtorList debtors={filteredAndSortedDebtors} isLoading={isLoading} />
            </motion.div>
        </AnimatePresence>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>Built for a better way to track debts.</p>
      </footer>
    </div>
  );
}

