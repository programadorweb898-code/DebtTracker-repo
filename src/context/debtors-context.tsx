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
        // El deudor existe, actualizarlo
        const existingDebtorDoc = querySnapshot.docs[0];
        const existingDebtorData = existingDebtorDoc.data() as Debtor;
        const updatedDebts = [...existingDebtorData.debts, newDebtEntry];
        const newTotalDebt = existingDebtorData.totalDebt + amount;

        await updateDoc(existingDebtorDoc.ref, {
          debts: updatedDebts,
          totalDebt: newTotalDebt,
        });
        toast({
          title: '¡Éxito!',
          description: `Se añadieron ${formatCurrency(amount)} a la deuda de ${trimmedAlias}.`,
        });
      } else {
        // El deudor no existe, crearlo
        await addDoc(debtorsColRef, {
          alias: trimmedAlias,
          ownerUid: user.uid,
          totalDebt: amount,
          debts: [newDebtEntry],
        });
        toast({
          title: '¡Éxito!',
          description: `Nuevo deudor ${trimmedAlias} añadido con una deuda de ${formatCurrency(amount)}.`,
        });
      }
    } catch (error) {
      console.error('Error al añadir deuda:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo añadir la deuda. Por favor, inténtalo de nuevo.',
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
        // La deuda está saldada, eliminar al deudor
        await deleteDoc(debtorDoc.ref);
        toast({
          title: '¡Deuda Saldada!',
          description: `La deuda de ${debtorData.alias} ha sido completamente pagada y eliminada.`,
        });
      } else {
        // Actualizar la deuda
        const updatedDebts = [...debtorData.debts, paymentEntry];
        await updateDoc(debtorDoc.ref, {
          debts: updatedDebts,
          totalDebt: newTotalDebt,
        });
        toast({
          title: '¡Pago Registrado!',
          description: `Se registró un pago de ${formatCurrency(amount)} para ${debtorData.alias}.`,
        });
      }
      return 'SUCCESS';
    } catch (error) {
      console.error('Error al pagar la deuda:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo procesar el pago. Por favor, inténtalo de nuevo.',
      });
      // Este es un retorno genérico, podría necesitar un manejo de errores más específico
      return 'DEBTOR_NOT_FOUND';
    }
  };

  const deleteDebtor = async (debtorId: string) => {
    if (!user) return;
    try {
      const docRef = doc(firestore, 'debtors', debtorId);
      await deleteDoc(docRef);
      toast({
        title: 'Deudor Eliminado',
        description: 'El deudor ha sido eliminado exitosamente.',
      });
    } catch (error) {
      console.error('Error al eliminar deudor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar al deudor. Por favor, inténtalo de nuevo.',
      });
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
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
    throw new Error('useDebtors debe ser usado dentro de un DebtorsProvider');
  }
  return context;
};
