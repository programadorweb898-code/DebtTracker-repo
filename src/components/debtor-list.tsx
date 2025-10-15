"use client";

import type { Debtor } from '@/lib/types';
import { DebtorCard } from './debtor-card';
import { Skeleton } from './ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

interface DebtorListProps {
  debtors: Debtor[];
  isLoading: boolean;
}

export function DebtorList({ debtors, isLoading }: DebtorListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg bg-card">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (debtors.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold text-muted-foreground">No debtors found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or adding a new debtor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {debtors.map((debtor, index) => (
          <motion.div
            key={debtor.alias}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <DebtorCard debtor={debtor} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
