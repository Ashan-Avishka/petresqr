'use client';

import { useAuthContext } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import OverviewPanel from '../../../../components/Dashboard/Admin/OverviewPanel';

export default function OverviewPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') router.replace('/dashboard/pets');
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') return null;
  return <OverviewPanel />;
}
