'use client';

import { useAuthContext } from '../../../../contexts/AuthContext';
import PetsPanel from '../../../../components/Dashboard/Admin/PetsPanel';
import PetsTab from '../../../../components/Dashboard/PetsTab';

export default function PetsPage() {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  return user?.role === 'admin' ? <PetsPanel /> : <div className="h-full overflow-y-auto pr-1"><PetsTab /></div>;
}
