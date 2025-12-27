"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  uid: string;
  email: string;
  createdAt: string;
  debtors: any[];
  totalDebtAmount: number;
  debtorsCount: number;
}

export function UsersTable({ users, onRefresh }: { users: User[]; onRefresh: () => void }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.uid }),
      });

      if (response.ok) {
        toast({
          title: 'Usuario eliminado',
          description: 'El usuario ha sido eliminado exitosamente.',
        });
        onRefresh();
      } else {
        throw new Error('Error al eliminar usuario');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el usuario.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-center">Deudores</TableHead>
              <TableHead className="text-right">Deuda Total</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{user.debtorsCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(user.totalDebtAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de detalles de usuario */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información detallada del usuario y sus deudores
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Información del usuario */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UID</p>
                      <p className="font-mono text-xs">{selectedUser.uid}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                      <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Deudores</p>
                      <p className="font-medium">{selectedUser.debtorsCount}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Deuda Total</p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(selectedUser.totalDebtAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de deudores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deudores</CardTitle>
                  <CardDescription>
                    {selectedUser.debtorsCount} deudores registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedUser.debtors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Este usuario no tiene deudores registrados
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedUser.debtors.map((debtor: any) => (
                        <div
                          key={debtor.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">{debtor.alias}</h4>
                            <Badge variant="destructive">
                              {formatCurrency(debtor.totalDebt)}
                            </Badge>
                          </div>

                          {/* Historial de deudas */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Historial ({debtor.debts?.length || 0} transacciones)
                            </p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {debtor.debts?.map((debt: any) => (
                                <div
                                  key={debt.id}
                                  className="flex items-center justify-between text-sm py-1 px-2 bg-muted/50 rounded"
                                >
                                  <span className="text-muted-foreground">
                                    {formatDate(debt.date)}
                                  </span>
                                  <span
                                    className={
                                      debt.amount > 0
                                        ? 'text-destructive font-medium'
                                        : 'text-green-600 font-medium'
                                    }
                                  >
                                    {debt.amount > 0 ? '+' : ''}
                                    {formatCurrency(debt.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente al usuario{' '}
              <span className="font-semibold">{userToDelete?.email}</span> y todos sus
              datos asociados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
