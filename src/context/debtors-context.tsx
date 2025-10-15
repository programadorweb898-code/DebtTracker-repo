"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { Debtor } from '@/lib/types';

interface DebtorsState {
  debtors: Debtor[];
}

type Action =
  | { type: 'SET_DEBTORS'; payload: Debtor[] }
  | { type: 'ADD_DEBT'; payload: { alias: string; amount: number } }
  | { type: 'PAY_DEBT'; payload: { alias: string; amount: number } }
  | { type: 'DELETE_DEBTOR'; payload: { alias: string } };

const initialState: DebtorsState = {
  debtors: [],
};

const debtorsReducer = (state: DebtorsState, action: Action): DebtorsState => {
  switch (action.type) {
    case 'SET_DEBTORS':
      return { ...state, debtors: action.payload };
    case 'ADD_DEBT': {
      const { alias, amount } = action.payload;
      const trimmedAlias = alias.trim();
      const existingDebtorIndex = state.debtors.findIndex((d) => d.alias.toLowerCase() === trimmedAlias.toLowerCase());
      const newDebts = [...state.debtors];

      const newDebt = {
        id: crypto.randomUUID(),
        amount,
        date: new Date().toISOString(),
      };

      if (existingDebtorIndex > -1) {
        const updatedDebtor = { ...newDebts[existingDebtorIndex] };
        updatedDebtor.debts = [...updatedDebtor.debts, newDebt];
        newDebts[existingDebtorIndex] = updatedDebtor;
      } else {
        newDebts.push({
          alias: trimmedAlias,
          debts: [newDebt],
        });
      }
      return { ...state, debtors: newDebts };
    }
    case 'PAY_DEBT': {
        const { alias, amount } = action.payload;
        const trimmedAlias = alias.trim();
        const existingDebtorIndex = state.debtors.findIndex((d) => d.alias.toLowerCase() === trimmedAlias.toLowerCase());

        if (existingDebtorIndex === -1) {
            return state; 
        }
        
        const debtor = state.debtors[existingDebtorIndex];
        const totalDebt = debtor.debts.reduce((sum, debt) => sum + debt.amount, 0);
        
        if (amount > totalDebt) {
          // This case is handled in the component, but as a fallback
          return state;
        }

        const newDebtsList = [...state.debtors];
        const updatedDebtor = { ...newDebtsList[existingDebtorIndex] };

        const paymentEntry = {
            id: crypto.randomUUID(),
            amount: -amount,
            date: new Date().toISOString(),
        };

        updatedDebtor.debts = [...updatedDebtor.debts, paymentEntry];

        const newTotalDebt = totalDebt - amount;
        
        if (newTotalDebt <= 0) {
            // Settle the debt and remove the debtor
            return {
                ...state,
                debtors: state.debtors.filter((d) => d.alias.toLowerCase() !== trimmedAlias.toLowerCase()),
            };
        } else {
            // Update the debtor's debt list
            newDebtsList[existingDebtorIndex] = updatedDebtor;
            return { ...state, debtors: newDebtsList };
        }
    }
    case 'DELETE_DEBTOR': {
      const { alias } = action.payload;
      const trimmedAlias = alias.trim();
      return {
        ...state,
        debtors: state.debtors.filter((d) => d.alias.toLowerCase() !== trimmedAlias.toLowerCase()),
      };
    }
    default:
      return state;
  }
};

type PayDebtResult = 'SUCCESS' | 'DEBTOR_NOT_FOUND' | 'PAYMENT_EXCEEDS_DEBT';

const initialContextValue = {
    ...initialState,
    isLoading: true,
    addDebt: (alias: string, amount: number) => {},
    payDebt: (alias: string, amount: number): PayDebtResult => 'DEBTOR_NOT_FOUND',
    deleteDebtor: (alias: string) => {},
};

const DebtorsContext = createContext(initialContextValue);

const DEBTORS_STORAGE_KEY = 'debt-tracker-app';

export const DebtorsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(debtorsReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedDebtors = localStorage.getItem(DEBTORS_STORAGE_KEY);
      if (storedDebtors) {
        dispatch({ type: 'SET_DEBTORS', payload: JSON.parse(storedDebtors) });
      } else {
        // Pre-populate with dummy data if nothing is in storage
        const dummyData: Debtor[] = [
            { alias: 'JohnDoe', debts: [{ id: '1', amount: 150, date: new Date(Date.now() - 86400000 * 5).toISOString() }, { id: '2', amount: 50, date: new Date(Date.now() - 86400000 * 2).toISOString() }] },
            { alias: 'JaneSmith', debts: [{ id: '3', amount: 300, date: new Date(Date.now() - 86400000 * 10).toISOString() }] },
            { alias: 'PeterJones', debts: [{ id: '4', amount: 75.50, date: new Date(Date.now() - 86400000 * 1).toISOString() }] },
        ];
        dispatch({ type: 'SET_DEBTORS', payload: dummyData });
      }
    } catch (error) {
      console.error("Failed to load debtors from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem(DEBTORS_STORAGE_KEY, JSON.stringify(state.debtors));
        } catch (error) {
            console.error("Failed to save debtors to localStorage", error);
        }
    }
  }, [state.debtors, isLoading]);

  const addDebt = (alias: string, amount: number) => {
    dispatch({ type: 'ADD_DEBT', payload: { alias, amount } });
  };

  const payDebt = (alias: string, amount: number): PayDebtResult => {
    const trimmedAlias = alias.trim();
    const debtor = state.debtors.find((d) => d.alias.toLowerCase() === trimmedAlias.toLowerCase());
    if (!debtor) {
        return 'DEBTOR_NOT_FOUND';
    }

    const totalDebt = debtor.debts.reduce((sum, debt) => sum + debt.amount, 0);

    if (amount > totalDebt) {
        return 'PAYMENT_EXCEEDS_DEBT';
    }

    dispatch({ type: 'PAY_DEBT', payload: { alias: trimmedAlias, amount } });
    return 'SUCCESS';
  };

  const deleteDebtor = (alias: string) => {
    dispatch({ type: 'DELETE_DEBTOR', payload: { alias } });
  };

  return (
    <DebtorsContext.Provider value={{ debtors: state.debtors, isLoading, addDebt, payDebt, deleteDebtor }}>
      {children}
    </DebtorsContext.Provider>
  );
};

export const useDebtors = () => {
  const context = useContext(DebtorsContext);
  if (context === undefined) {
    throw new Error('useDebtors must be used within a DebtorsProvider');
  }
  return context;
};
