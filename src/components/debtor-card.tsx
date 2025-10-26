"use client";

import type { Debtor } from '@/lib/types';
import Link from 'next/link';
import { useDebtors } from '@/context/debtors-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DebtorCardProps {
  debtor: Debtor;
}

export function DebtorCard({ debtor }: DebtorCardProps) {
  const { deleteDebtor } = useDebtors();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const lastTransaction = debtor.debts.length > 0 
    ? debtor.debts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const handleSettleDebt = () => {
    deleteDebtor(debtor.id);
  };

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline truncate">{debtor.alias}</CardTitle>
        {lastTransaction && <CardDescription>Última transacción el {new Date(lastTransaction.date).toLocaleDateString('es-ES')}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-4xl font-bold text-destructive">{formatCurrency(debtor.totalDebt)}</p>
        <p className="text-sm text-muted-foreground">Deuda total pendiente</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 /> Saldar Deuda
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marca la deuda de "{debtor.alias}" como totalmente pagada y la eliminará permanentemente de tu lista.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSettleDebt}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button asChild variant="outline" size="sm">
          <Link href={`/debtors/${encodeURIComponent(debtor.alias)}`}>
            Ver Detalles <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
