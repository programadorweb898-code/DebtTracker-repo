"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthContext, sendPasswordReset } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useAuth } from '@/firebase';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'El campo email es requerido.')
    .refine((val) => val.includes('@') && val.includes('.'), {
      message: 'Por favor, introduce una dirección de correo electrónico válida.',
    }),
  password: z.string().min(1, 'El campo contraseña es requerido.'),
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'El campo email es requerido.')
    .refine((val) => val.includes('@') && val.includes('.'), {
      message: 'Por favor, introduce una dirección de correo electrónico válida.',
    }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: error.message || 'Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
    setIsResetLoading(true);
    try {
      await sendPasswordReset(auth, data.email);
      toast({
        title: 'Correo enviado',
        description: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
      });
      setIsResetDialogOpen(false);
      forgotPasswordForm.reset();
    } catch (error: any) {
       // Solo mostramos error, NO cerramos el diálogo para que el usuario vea el mensaje
       toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo enviar el correo de restablecimiento.',
      });
    } finally {
        setIsResetLoading(false);
    }
  };

  // Manejador para cuando se cierra el diálogo sin enviar
  const handleDialogClose = (open: boolean) => {
    setIsResetDialogOpen(open);
    if (!open) {
      // Limpiamos el formulario y los errores cuando se cierra el diálogo
      forgotPasswordForm.reset();
      forgotPasswordForm.clearErrors();
    }
  };

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
          <CardTitle className="font-headline text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa a tu cuenta para administrar tus deudas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Contraseña</FormLabel>
                        <Dialog open={isResetDialogOpen} onOpenChange={handleDialogClose}>
                            <DialogTrigger asChild>
                                <Button variant="link" type="button" className="p-0 h-auto text-xs">
                                ¿Olvidaste tu contraseña?
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Restablecer Contraseña</DialogTitle>
                                <DialogDescription>
                                    Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                </DialogDescription>
                                </DialogHeader>
                                <Form {...forgotPasswordForm}>
                                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                                    <FormField
                                    control={forgotPasswordForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="tu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">Cancelar</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isResetLoading}>
                                            {isResetLoading ? 'Enviando...' : 'Enviar enlace'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
