"use client";

import { useState, useMemo } from 'react';
import type { Debtor } from '@/lib/types';
import { useDebtors } from '@/context/debtors-context';
import { AppHeader } from '@/components/app-header';
import { StatsCards } from '@/components/stats-cards';
import { DebtorFilters } from '@/components/debtor-filters';
import { DebtorList } from '@/components/debtor-list';
import { AnimatePresence, motion } from 'framer-motion';
import { AISummary } from './ai-summary';
import { ChatWithAI } from './chat-with-ai';
import { PayDebtDialog } from './pay-debt-dialog';
import { AddDebtorDialog } from './add-debtor-dialog';

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
      const totalDebt = d.totalDebt;
      const isAfterMin = minDebt > 0 ? totalDebt >= minDebt : true;
      const isBeforeMax = maxDebt !== Infinity ? totalDebt <= maxDebt : true;
      return isAfterMin && isBeforeMax;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'debt-asc':
          return a.totalDebt - b.totalDebt;
        case 'debt-desc':
          return b.totalDebt - a.totalDebt;
        case 'alias-asc':
          return a.alias.localeCompare(b.alias);
        default:
          return 0;
      }
    });
  }, [debtors, searchTerm, sortOption, debtRange]);

  return (
    <div className="flex flex-col min-h-screen">
       <AppHeader />
      {/* Barra de acciones debajo del encabezado */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-background/90 backdrop-blur-sm border-b py-4">
        <div className="container mx-auto flex justify-center items-center gap-4">
          <PayDebtDialog />
          <AddDebtorDialog />
        </div>
      </div>
       
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-40">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatsCards />
            <AISummary />
          </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
        >
            <ChatWithAI />
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <DebtorFilters
              onSearch={setSearchTerm}
              onSort={(value) => setSortOption(value as SortOption)}
              sortValue={sortOption}
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
        <p>Construido para una mejor forma de seguir las deudas.</p>
      </footer>
    </div>
  );
}
