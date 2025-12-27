"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAdmin } from '@/hooks/use-admin';
import { useUser } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { UsersTable } from '@/components/admin/users-table';
import { ErrorState } from '@/components/admin/error-state';
import { Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [users, setUsers] = useState([]);
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
      console.log('Fetching users from API...');
      const response = await fetch('/api/admin/users');
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('Users data:', data);
      
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
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
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a la App
                </Button>
              </Link>
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
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
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
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/">Ver Aplicación</Link>
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
