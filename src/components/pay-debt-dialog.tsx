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
  alias: z.string().min(1, 'Alias is required').max(50, 'Alias is too long'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
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

  const onSubmit = (data: PayDebtFormValues) => {
    const result = payDebt(data.alias, data.amount);
    
    switch (result) {
      case 'SUCCESS':
        toast({
            title: 'Success!',
            description: `Registered a payment of $${data.amount} for ${data.alias}.`,
        });
        form.reset();
        setIsOpen(false);
        break;
      case 'DEBTOR_NOT_FOUND':
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Debtor with alias "${data.alias}" not found.`,
        });
        break;
      case 'PAYMENT_EXCEEDS_DEBT':
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Payment amount exceeds the total debt for ${data.alias}.`,
        });
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <HandCoins />
          Pay Debt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Register a Payment</DialogTitle>
          <DialogDescription>
            Enter the debtor's alias and the amount they have paid.
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
                    <Input placeholder="e.g., John Doe" {...field} />
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
                  <FormLabel>Amount Paid</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Register Payment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
