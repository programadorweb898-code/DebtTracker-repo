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
      const existingDebtorIndex = state.debtors.findIndex((d) => d.alias.toLowerCase() === alias.toLowerCase());
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
          alias,
          debts: [newDebt],
        });
      }
      return { ...state, debtors: newDebts };
    }
    case 'PAY_DEBT': {
        const { alias, amount } = action.payload;
        const existingDebtorIndex = state.debtors.findIndex((d) => d.alias.toLowerCase() === alias.toLowerCase());

        if (existingDebtorIndex === -1) {
            return state; // Debtor not found, do nothing to the state
        }
        
        const newDebtsList = [...state.debtors];
        const updatedDebtor = { ...newDebtsList[existingDebtorIndex] };

        // Add a negative amount to represent a payment
        const paymentEntry = {
            id: crypto.randomUUID(),
            amount: -amount,
            date: new Date().toISOString(),
        };

        updatedDebtor.debts = [...updatedDebtor.debts, paymentEntry];
        newDebtsList[existingDebtorIndex] = updatedDebtor;

        return { ...state, debtors: newDebtsList };
    }
    case 'DELETE_DEBTOR': {
      const { alias } = action.payload;
      return {
        ...state,
        debtors: state.debtors.filter((d) => d.alias !== alias),
      };
    }
    default:
      return state;
  }
};

const initialContextValue = {
    ...initialState,
    isLoading: true,
    addDebt: (alias: string, amount: number) => {},
    payDebt: (alias: string, amount: number): boolean => false,
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
            { alias: 'John Doe', debts: [{ id: '1', amount: 150, date: new Date(Date.now() - 86400000 * 5).toISOString() }, { id: '2', amount: 50, date: new Date(Date.now() - 86400000 * 2).toISOString() }] },
            { alias: 'Jane Smith', debts: [{ id: '3', amount: 300, date: new Date(Date.now() - 86400000 * 10).toISOString() }] },
            { alias: 'Peter Jones', debts: [{ id: '4', amount: 75.50, date: new Date(Date.now() - 86400000 * 1).toISOString() }] },
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

  const payDebt = (alias: string, amount: number): boolean => {
    const debtorExists = state.debtors.some((d) => d.alias.toLowerCase() === alias.toLowerCase());
    if (debtorExists) {
        dispatch({ type: 'PAY_DEBT', payload: { alias, amount } });
        return true;
    }
    return false;
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
