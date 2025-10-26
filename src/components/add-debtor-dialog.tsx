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
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const debtorSchema = z.object({
  alias: z.string()
    .trim()
    .min(1, 'El alias es requerido.')
    .max(50, 'El alias es demasiado largo.')
    .refine((val) => !/\s/.test(val), {
        message: 'El alias no puede contener espacios.',
    }),
  amount: z.coerce.number().positive('El monto debe ser un número positivo.'),
});

type DebtorFormValues = z.infer<typeof debtorSchema>;

export function AddDebtorDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addDebt } = useDebtors();

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      alias: '',
      amount: undefined,
    },
  });

  const onSubmit = async (data: DebtorFormValues) => {
    await addDebt(data.alias, data.amount);
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Añadir Deuda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Añadir Nueva Deuda</DialogTitle>
          <DialogDescription>
            Introduce el alias del deudor y el monto de la deuda. Si el alias ya existe, la deuda se sumará.
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
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ej., 50.25" step="0.01" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Añadiendo..." : "Añadir Deuda"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
