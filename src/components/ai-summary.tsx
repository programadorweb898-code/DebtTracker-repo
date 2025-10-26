"use client";

import { useState } from 'react';
import { useDebtors } from '@/context/debtors-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { summarizeDebts } from '@/ai/flows/summarize-debts';
import { useToast } from '@/hooks/use-toast';

export function AISummary() {
  const { debtors, isLoading: isLoadingDebtors } = useDebtors();
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoadingSummary(true);
    setSummary('');
    try {
      const result = await summarizeDebts(debtors);
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generando resumen:', error);
      toast({
        variant: 'destructive',
        title: 'Error de IA',
        description: 'No se pudo generar el resumen. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const canSummarize = !isLoadingDebtors && debtors.length > 0;

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumen con IA</CardTitle>
        <Sparkles className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoadingSummary ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : summary ? (
          <p className="text-sm text-muted-foreground">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Haz clic en el botón para generar un resumen de tu situación de deudas.
          </p>
        )}
        <Button
          onClick={handleSummarize}
          disabled={!canSummarize || isLoadingSummary}
          className="mt-4 w-full"
          size="sm"
        >
          {isLoadingSummary ? 'Generando...' : 'Generar Resumen'}
        </Button>
      </CardContent>
    </Card>
  );
}
