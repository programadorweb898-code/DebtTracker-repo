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
    .min(1, 'Alias is required')
    .max(50, 'Alias is too long')
    .refine((val) => !/\s/.test(val), {
        message: 'Alias cannot contain spaces.',
    }),
  amount: z.coerce.number().positive('Amount must be a positive number'),
});

type DebtorFormValues = z.infer<typeof debtorSchema>;

export function AddDebtorDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { addDebt, debtors } = useDebtors();
  const { toast } = useToast();

  const form = useForm<DebtorFormValues>({
    resolver: zodResolver(debtorSchema),
    defaultValues: {
      alias: '',
      amount: '' as any,
    },
  });

  const onSubmit = (data: DebtorFormValues) => {
    const trimmedAlias = data.alias.trim();
    const existingDebtor = debtors.find(d => d.alias.toLowerCase() === trimmedAlias.toLowerCase());
    addDebt(trimmedAlias, data.amount);
    toast({
        title: 'Success!',
        description: existingDebtor
            ? `Added $${data.amount} to ${existingDebtor.alias}'s debt.`
            : `New debtor ${trimmedAlias} added with a debt of $${data.amount}.`,
    });
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add Debt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Debt</DialogTitle>
          <DialogDescription>
            Enter debtor's alias and the amount of debt. If the alias exists, the debt will be added.
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
                    <Input placeholder="e.g., JohnDoe" {...field} />
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50.25" step="0.01" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Debt</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
