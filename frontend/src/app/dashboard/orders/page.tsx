'use client';

import { useAuthContext } from '../../../../contexts/AuthContext';
import OrdersPanel from '../../../../components/Dashboard/Admin/OrdersPanel';
import OrdersTab from '../../../../components/Dashboard/OrdersTab';

export default function OrdersPage() {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  return user?.role === 'admin' ? <OrdersPanel /> : <div className="h-full overflow-y-auto pr-1"><OrdersTab /></div>;
}
