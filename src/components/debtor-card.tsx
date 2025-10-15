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
import { useToast } from '@/hooks/use-toast';

interface DebtorCardProps {
  debtor: Debtor;
}

export function DebtorCard({ debtor }: DebtorCardProps) {
  const { deleteDebtor } = useDebtors();
  const { toast } = useToast();

  const totalDebt = debtor.debts.reduce((sum, debt) => sum + debt.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const lastDebtDate = new Date(debtor.debts[debtor.debts.length - 1].date);

  const handleSettleDebt = () => {
    deleteDebtor(debtor.alias);
    toast({
        title: 'Debt Settled!',
        description: `${debtor.alias} has been removed from the list.`,
        variant: 'default',
    });
  };

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline truncate">{debtor.alias}</CardTitle>
        <CardDescription>Last debt added on {lastDebtDate.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-4xl font-bold text-destructive">{formatCurrency(totalDebt)}</p>
        <p className="text-sm text-muted-foreground">Total outstanding debt</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 /> Settle Debt
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action marks the debt for "{debtor.alias}" as fully paid and will permanently remove them from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSettleDebt}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button asChild variant="outline" size="sm">
          <Link href={`/debtors/${encodeURIComponent(debtor.alias)}`}>
            View Details <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
