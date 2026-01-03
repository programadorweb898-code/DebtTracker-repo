"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAdmin } from '@/hooks/use-admin';
import { useUser, useFirestore } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { UsersTable } from '@/components/admin/users-table';
import { ErrorState } from '@/components/admin/error-state';
import { Shield, RefreshCw, ArrowLeft, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuthContext } from '@/context/auth-context';

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { logout } = useAuthContext();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    
    if (!isUserLoading && user && !isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Acceso Denegado',
        description: 'No tienes permisos para acceder al panel de administración.',
      });
      router.push('/');
    }
  }, [isAdmin, user, isUserLoading, router, toast]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching users from Firestore (client-side)...');
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Importar funciones de Firestore
      const { collection, getDocs } = await import('firebase/firestore');
      
      // Obtener todos los usuarios
      const usersRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      console.log('Users found:', usersSnapshot.size);
      
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Obtener todos los deudores
      const debtorsRef = collection(firestore, 'debtors');
      const debtorsSnapshot = await getDocs(debtorsRef);
      
      console.log('Debtors found:', debtorsSnapshot.size);
      
      // Procesar usuarios con sus deudores
      const usersWithDebtors = usersData.map((userData: any) => {
        const userDebtors = debtorsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((debtor: any) => debtor.ownerUid === userData.uid);
        
        const totalDebt = userDebtors.reduce((sum: number, debtor: any) => sum + (debtor.totalDebt || 0), 0);
        
        return {
          ...userData,
          debtors: userDebtors,
          totalDebtAmount: totalDebt,
          debtorsCount: userDebtors.length,
        };
      });
      
      // Ordenar por fecha de creación (más reciente primero)
      usersWithDebtors.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      console.log('Processed users:', usersWithDebtors.length);
      setUsers(usersWithDebtors);
      
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      fetchUsers();
    }
  }, [isAdmin, user]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold">Panel de Administración</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gestiona usuarios y supervisa el sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button 
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }} 
                variant="ghost" 
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AdminStatsCards users={users} />
            
            <Card>
              <CardHeader>
                <CardTitle>Bienvenido, Administrador</CardTitle>
                <CardDescription>
                  Aquí puedes ver un resumen general del sistema y gestionar usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Información del Sistema</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Total de usuarios registrados: <span className="font-medium text-foreground">{users.length}</span></li>
                      <li>• Usuarios con deudores activos: <span className="font-medium text-foreground">{users.filter((u: any) => u.debtorsCount > 0).length}</span></li>
                      <li>• Email de administrador: <span className="font-medium text-foreground">{user?.email}</span></li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Acciones Rápidas</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={fetchUsers}>
                        Actualizar Datos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Lista completa de usuarios registrados en el sistema con sus estadísticas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-4">Cargando usuarios...</p>
                  </div>
                ) : error ? (
                  <ErrorState message={error} onRetry={fetchUsers} />
                ) : (
                  <UsersTable users={users} onRefresh={fetchUsers} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
