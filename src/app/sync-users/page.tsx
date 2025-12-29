"use client";

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase/provider';
import { useIsAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function SyncUsersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const isAdmin = useIsAdmin();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSyncCurrentUser = async () => {
    if (!user) {
      setStatus('error');
      setMessage('No estás autenticado');
      return;
    }

    setStatus('loading');
    try {
      const { collection, query, where, getDocs, doc, setDoc } = await import('firebase/firestore');
      
      // Verificar si el usuario ya existe en Firestore
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatus('error');
        setMessage('Tu usuario ya existe en Firestore. No necesitas sincronización.');
        return;
      }

      // Crear el documento del usuario
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        role: 'user', // Por defecto es usuario normal
      });

      setStatus('success');
      setMessage('¡Usuario sincronizado exitosamente en Firestore! Ya puedes usar la aplicación normalmente.');
    } catch (error) {
      console.error('Error syncing user:', error);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            <CardTitle>Sincronizar Usuario</CardTitle>
          </div>
          <CardDescription>
            Crea tu documento de usuario en Firestore si no existe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>UID:</strong> <code className="text-xs">{user.uid}</code>
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">¿Cuándo usar esto?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Si te registraste pero no apareces en el dashboard</li>
              <li>• Si Firebase Auth tiene tu cuenta pero Firestore no</li>
              <li>• Si hubo un error durante el registro</li>
            </ul>
          </div>

          {status === 'idle' && (
            <Button onClick={handleSyncCurrentUser} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar mi Usuario
            </Button>
          )}

          {status === 'loading' && (
            <Button disabled className="w-full">
              Sincronizando...
            </Button>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Ir a la Aplicación
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{message}</p>
              </div>
              {message.includes('ya existe') ? (
                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="w-full"
                >
                  Ir a la Aplicación
                </Button>
              ) : (
                <Button 
                  onClick={handleSyncCurrentUser} 
                  variant="outline" 
                  className="w-full"
                >
                  Reintentar
                </Button>
              )}
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p><strong>Nota:</strong> Esta página crea el documento de usuario en Firestore si no existe. Es segura y solo afecta a tu propia cuenta.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
