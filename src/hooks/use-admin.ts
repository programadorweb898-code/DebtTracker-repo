import { useMemo } from 'react';
import { useUser } from '@/firebase/provider';

export function useIsAdmin() {
  const { user } = useUser();
  
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    return user.email.toLowerCase() === adminEmail?.toLowerCase();
  }, [user]);

  return isAdmin;
}
