"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebtors } from '@/context/debtors-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { HandCoins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const payDebtSchema = z.object({
  alias: z.string()
    .trim()
    .min(1, 'El alias es requerido.')
    .max(50, 'El alias es demasiado largo.')
    .refine((val) => !/\s/.test(val), {
        message: 'El alias no puede contener espacios.',
    }),
  amount: z.coerce.number().positive('El monto debe ser un número positivo.'),
});

type PayDebtFormValues = z.infer<typeof payDebtSchema>;

export function PayDebtDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { payDebt } = useDebtors();
  const { toast } = useToast();

  const form = useForm<PayDebtFormValues>({
    resolver: zodResolver(payDebtSchema),
    defaultValues: {
      alias: '',
      amount: undefined,
    },
  });

  const onSubmit = async (data: PayDebtFormValues) => {
    const result = await payDebt(data.alias, data.amount);
    
    switch (result) {
      case 'SUCCESS':
        form.reset();
        setIsOpen(false);
        break;
      case 'DEBTOR_NOT_FOUND':
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `No se encontró un deudor con el alias "${data.alias}".`,
        });
        break;
      case 'PAYMENT_EXCEEDS_DEBT':
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `El monto del pago excede la deuda total de ${data.alias}.`,
        });
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <HandCoins />
          Registrar Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar un Pago</DialogTitle>
          <DialogDescription>
            Introduce el alias del deudor y el monto que ha pagado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., JuanPerez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Pagado</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ej., 25.00" step="0.01" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Procesando..." : "Registrar Pago"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
