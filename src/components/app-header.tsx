"use client";

import { Button } from './ui/button';
import { useAuthContext } from '@/context/auth-context';
import { Coins, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function AppHeader() {
  const { logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Elemento Izquierdo */}
        <div className="w-1/3 flex justify-start">
          <div className="flex items-center gap-3">
            <Coins className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
             <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground tracking-tighter hidden sm:block">
              DebtTracker
            </h1>
          </div>
        </div>

        {/* Elementos Centrados (Título para móvil) */}
        <div className="w-1/3 flex justify-center sm:hidden">
           <h1 className="font-headline text-3xl font-bold text-foreground tracking-tighter">
              DebtTracker
            </h1>
        </div>

        {/* Elemento Derecho */}
        <div className="w-1/3 flex justify-end">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú de usuario">
                  <LogOut className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem>
                    Cerrar Sesión
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción cerrará tu sesión actual. Tendrás que volver a iniciar sesión para continuar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Aceptar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
