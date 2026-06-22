'use client';

import { useAuthContext } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UsersPanel from '../../../../components/Dashboard/Admin/UsersPanel';

export default function UsersPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') router.replace('/dashboard/pets');
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') return null;
  return <UsersPanel />;
}
