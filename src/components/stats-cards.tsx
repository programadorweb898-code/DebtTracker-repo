"use client";

import { useDebtors } from '@/context/debtors-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Landmark } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function StatsCards() {
  const { debtors, isLoading } = useDebtors();

  const totalDebtors = debtors.length;
  const totalDebt = debtors.reduce((acc, debtor) => acc + debtor.totalDebt, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deudores Totales</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-3xl font-bold font-headline">{totalDebtors}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Número total de deudores activos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Adeudado</CardTitle>
          <Landmark className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-3xl font-bold font-headline">
              {formatCurrency(totalDebt)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Suma de todas las deudas pendientes
          </p>
        </CardContent>
      </Card>
    </>
  );
}
