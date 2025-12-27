"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

interface StatsData {
  totalUsers: number;
  totalDebtors: number;
  totalDebtAmount: number;
  activeUsersToday: number;
}

export function AdminStatsCards({ users }: { users: any[] }) {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalDebtors: 0,
    totalDebtAmount: 0,
    activeUsersToday: 0,
  });

  useEffect(() => {
    if (!users) return;

    const totalDebtors = users.reduce((sum, user) => sum + (user.debtorsCount || 0), 0);
    const totalDebtAmount = users.reduce((sum, user) => sum + (user.totalDebtAmount || 0), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= today;
    }).length;

    setStats({
      totalUsers: users.length,
      totalDebtors,
      totalDebtAmount,
      activeUsersToday,
    });
  }, [users]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeUsersToday} registrados hoy
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deudores</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDebtors}</div>
          <p className="text-xs text-muted-foreground">
            Registrados en el sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalDebtAmount)}</div>
          <p className="text-xs text-muted-foreground">
            Suma de todas las deudas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio por Usuario</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalUsers > 0 
              ? formatCurrency(stats.totalDebtAmount / stats.totalUsers)
              : formatCurrency(0)
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Deuda promedio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
