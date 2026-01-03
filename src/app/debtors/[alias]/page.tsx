"use client";

import { useDebtors } from '@/context/debtors-context';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Landmark, Calendar } from 'lucide-react';
import { useMemo } from 'react';

// Forzar renderizado dinámico para evitar pre-render durante build
export const dynamic = 'force-dynamic';

export default function DebtorDetailPage() {
  const params = useParams();
  const { debtors, isLoading } = useDebtors();
  
  const alias = useMemo(() => typeof params.alias === 'string' ? decodeURIComponent(params.alias) : '', [params.alias]);
  
  const debtor = useMemo(() => {
    if (isLoading || !debtors) return null;
    return debtors.find((d) => d.alias === alias);
  }, [debtors, isLoading, alias]);


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Cargando...</div>;
  }
  
  if (!debtor) {
    // We have to wait for loading to finish before we can say notFound
    if (!isLoading) {
      notFound();
    }
    return null; // Or a loading skeleton
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2"><User />{debtor.alias}</CardTitle>
          <CardDescription>Historial detallado de la deuda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-muted-foreground" />
            <p className="text-2xl font-bold">{formatCurrency(debtor.totalDebt)} <span className="text-sm font-normal text-muted-foreground">Deuda Total</span></p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{debtor.debts.length} registros de deuda</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {debtor.debts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((debt) => (
                    <TableRow key={debt.id}>
                    <TableCell>{new Date(debt.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      {debt.amount > 0 ? (
                        <span className="text-destructive">Deuda</span>
                      ) : (
                        <span className="text-green-600">Pago</span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${debt.amount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(debt.amount))}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
