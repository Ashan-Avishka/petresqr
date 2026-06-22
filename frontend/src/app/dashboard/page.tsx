'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../../contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    if (isLoading) return;
    if (user?.role === 'admin') router.replace('/dashboard/overview');
    else router.replace('/dashboard/pets');
  }, [user, isLoading, router]);

  return null;
}
