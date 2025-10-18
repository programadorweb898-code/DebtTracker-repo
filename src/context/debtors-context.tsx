"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Debtor, Debt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type PayDebtResult = 'SUCCESS' | 'DEBTOR_NOT_FOUND' | 'PAYMENT_EXCEEDS_DEBT';

interface DebtorsContextValue {
  debtors: Debtor[];
  isLoading: boolean;
  addDebt: (alias: string, amount: number) => Promise<void>;
  payDebt: (alias: string, amount: number) => Promise<PayDebtResult>;
  deleteDebtor: (debtorId: string) => Promise<void>;
}

const DebtorsContext = createContext<DebtorsContextValue | undefined>(undefined);

export const DebtorsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const debtorsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'debtors'), where('ownerUid', '==', user.uid));
  }, [firestore, user]);

  const { data: debtors, isLoading } = useCollection<Debtor>(debtorsQuery);

  const addDebt = async (alias: string, amount: number) => {
    if (!user) return;
    const trimmedAlias = alias.trim();
    const debtorsColRef = collection(firestore, 'debtors');
    const q = query(debtorsColRef, where('alias', '==', trimmedAlias), where('ownerUid', '==', user.uid));

    try {
      const querySnapshot = await getDocs(q);
      const newDebtEntry: Debt = {
        id: crypto.randomUUID(),
        amount,
        date: new Date().toISOString(),
      };

      if (!querySnapshot.empty) {
        // Debtor exists, update it
        const existingDebtorDoc = querySnapshot.docs[0];
        const existingDebtorData = existingDebtorDoc.data() as Debtor;
        const updatedDebts = [...existingDebtorData.debts, newDebtEntry];
        const newTotalDebt = existingDebtorData.totalDebt + amount;

        await updateDoc(existingDebtorDoc.ref, {
          debts: updatedDebts,
          totalDebt: newTotalDebt,
        });
        toast({
          title: 'Success!',
          description: `Added ${formatCurrency(amount)} to ${trimmedAlias}'s debt.`,
        });
      } else {
        // Debtor doesn't exist, create new
        await addDoc(debtorsColRef, {
          alias: trimmedAlias,
          ownerUid: user.uid,
          totalDebt: amount,
          debts: [newDebtEntry],
        });
        toast({
          title: 'Success!',
          description: `New debtor ${trimmedAlias} added with a debt of ${formatCurrency(amount)}.`,
        });
      }
    } catch (error) {
      console.error('Error adding debt:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add debt. Please try again.',
      });
    }
  };

  const payDebt = async (alias: string, amount: number): Promise<PayDebtResult> => {
    if (!user) return 'DEBTOR_NOT_FOUND';
    const trimmedAlias = alias.trim();
    const debtorsColRef = collection(firestore, 'debtors');
    const q = query(debtorsColRef, where('alias', '==', trimmedAlias), where('ownerUid', '==', user.uid));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return 'DEBTOR_NOT_FOUND';
      }

      const debtorDoc = querySnapshot.docs[0];
      const debtorData = debtorDoc.data() as Debtor;

      if (amount > debtorData.totalDebt) {
        return 'PAYMENT_EXCEEDS_DEBT';
      }

      const paymentEntry: Debt = {
        id: crypto.randomUUID(),
        amount: -amount,
        date: new Date().toISOString(),
      };

      const newTotalDebt = debtorData.totalDebt - amount;

      if (newTotalDebt <= 0) {
        // Debt is settled, delete the debtor
        await deleteDoc(debtorDoc.ref);
        toast({
          title: 'Debt Settled!',
          description: `${debtorData.alias}'s debt has been fully paid and removed.`,
        });
      } else {
        // Update debt
        const updatedDebts = [...debtorData.debts, paymentEntry];
        await updateDoc(debtorDoc.ref, {
          debts: updatedDebts,
          totalDebt: newTotalDebt,
        });
        toast({
          title: 'Payment Registered!',
          description: `Registered a payment of ${formatCurrency(amount)} for ${debtorData.alias}.`,
        });
      }
      return 'SUCCESS';
    } catch (error) {
      console.error('Error paying debt:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process payment. Please try again.',
      });
      // This is a generic return, might need more specific error handling
      return 'DEBTOR_NOT_FOUND';
    }
  };

  const deleteDebtor = async (debtorId: string) => {
    if (!user) return;
    try {
      const docRef = doc(firestore, 'debtors', debtorId);
      await deleteDoc(docRef);
      toast({
        title: 'Debtor Removed',
        description: 'The debtor has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting debtor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not remove the debtor. Please try again.',
      });
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const value = useMemo(
    () => ({
      debtors: debtors || [],
      isLoading,
      addDebt,
      payDebt,
      deleteDebtor,
    }),
    [debtors, isLoading, user]
  );

  return <DebtorsContext.Provider value={value}>{children}</DebtorsContext.Provider>;
};

export const useDebtors = () => {
  const context = useContext(DebtorsContext);
  if (context === undefined) {
    throw new Error('useDebtors must be used within a DebtorsProvider');
  }
  return context;
};
