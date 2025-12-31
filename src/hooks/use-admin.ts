import { useMemo } from 'react';
import { useUser } from '@/firebase/provider';

export function useIsAdmin() {
  const { user } = useUser();
  
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    // Solo verificar contra el email del panel de admin
    const adminPanelEmail = process.env.NEXT_PUBLIC_ADMIN_PANEL_EMAIL;
    return user.email.toLowerCase() === adminPanelEmail?.toLowerCase();
  }, [user]);

  return isAdmin;
}
