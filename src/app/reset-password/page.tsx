"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';
import { auth } from '@/firebase/config';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const resetPasswordSchema = z
  .object({
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres.')
        .max(20, 'La contraseña no puede tener más de 20 caracteres.')
        .regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una mayúscula.')
        .regex(/(?=.*[0-9])/, 'La contraseña debe contener al menos un número.')
        .regex(/(?=.*[!@#$%^&*])/, 'La contraseña debe contener al menos un caracter especial (!@#$%^&*).'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [oobCode, setOobCode] = useState<string | null>(null);
  
    useEffect(() => {
      const code = searchParams.get('oobCode');
      if (!code) {
        setError('El enlace no es válido o ha expirado. Por favor, solicita un nuevo enlace de restablecimiento.');
        setIsVerifying(false);
        return;
      }
      
      setOobCode(code);

      verifyPasswordResetCode(auth, code)
        .then(() => {
          setIsVerifying(false);
        })
        .catch(() => {
          setError('El enlace no es válido o ha expirado. Por favor, solicita un nuevo enlace de restablecimiento.');
          setIsVerifying(false);
        });
    }, [searchParams]);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
          password: '',
          confirmPassword: '',
        },
      });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!oobCode) return;
        setIsLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, data.password);
            toast({
                title: '¡Contraseña restablecida!',
                description: 'Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva contraseña.',
            });
            router.push('/login');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Hubo un problema al restablecer tu contraseña. El enlace puede haber expirado.',
            });
            setIsLoading(false);
        }
    };
    
    if (isVerifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Verificando enlace...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Estamos comprobando la validez de tu enlace de restablecimiento.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Enlace no válido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button asChild className="mt-4">
                            <Link href="/login">Volver a inicio de sesión</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <Coins className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
                        <h1 className="font-headline text-3xl font-bold text-foreground tracking-tighter">
                            DebtTracker
                        </h1>
                    </div>
                    <CardTitle className="font-headline text-2xl">Restablecer Contraseña</CardTitle>
                    <CardDescription>Crea tu nueva contraseña.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Restableciendo...' : 'Guardar nueva contraseña'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
