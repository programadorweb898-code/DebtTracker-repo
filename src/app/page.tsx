"use client";

import { useAuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DebtorsDashboard } from '@/components/debtors-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useIsAdmin } from '@/hooks/use-admin';

// Forzar renderizado dinámico para evitar pre-render durante build
export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Si es admin, redirigir al panel de admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, user, loading, router]);

  // Mostrar prompt de sincronización deshabilitado
  // useEffect(() => {
  //   if (user && !loading) {
  //     const timer = setTimeout(() => {
  //       setShowSyncPrompt(true);
  //     }, 3000);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [user, loading]);

  if (loading || !user || isAdmin) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-foreground">Cargando...</div>
        </div>
    );
  }

  return (
    <>
      <DebtorsDashboard />
      
      {/* Prompt de sincronización si hay problemas */}
      {showSyncPrompt && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-100">Configuración Pendiente</CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Si ves errores de permisos, es posible que tu perfil no se haya sincronizado correctamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => router.push('/sync-users')}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Perfil
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSyncPrompt(false)}
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
