"use client";

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, AlertCircle } from 'lucide-react';

// Forzar renderizado dinámico para evitar pre-render durante build
export const dynamic = 'force-dynamic';

export default function SetupAdminPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_PANEL_EMAIL;

  const handleSetupAdmin = async () => {
    if (!user) {
      setStatus('error');
      setMessage('No estás autenticado');
      return;
    }

    if (user.email?.toLowerCase() !== adminEmail?.toLowerCase()) {
      setStatus('error');
      setMessage(`Solo el administrador designado (${adminEmail}) puede hacer esto`);
      return;
    }

    setStatus('loading');
    try {
      // Buscar el documento del usuario
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Documento de usuario no encontrado');
      }

      const userDoc = querySnapshot.docs[0];
      
      // Actualizar con el rol de admin
      await updateDoc(userDoc.ref, {
        role: 'admin'
      });

      setStatus('success');
      setMessage('¡Rol de administrador configurado exitosamente! Recarga la página para acceder al panel de admin.');
    } catch (error) {
      console.error('Error setting up admin:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Debes iniciar sesión primero</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== adminEmail?.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
            <CardDescription>
              Solo el administrador ({adminEmail}) puede acceder a esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Configuración de Administrador</CardTitle>
          </div>
          <CardDescription>
            Configura el rol de administrador para tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Email actual:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>UID:</strong> <code className="text-xs">{user.uid}</code>
            </p>
          </div>

          {status === 'idle' && (
            <Button onClick={handleSetupAdmin} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Configurar Rol de Admin
            </Button>
          )}

          {status === 'loading' && (
            <Button disabled className="w-full">
              Configurando...
            </Button>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/admin'} 
                className="w-full"
              >
                Ir al Panel de Admin
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{message}</p>
              </div>
              <Button 
                onClick={handleSetupAdmin} 
                variant="outline" 
                className="w-full"
              >
                Reintentar
              </Button>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p><strong>Nota:</strong> Esta página solo es necesaria una vez para configurar tu rol de administrador. Después puedes eliminar este archivo.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
