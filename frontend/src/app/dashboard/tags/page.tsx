'use client';

import { useAuthContext } from '../../../../contexts/AuthContext';
import TagsPanel from '../../../../components/Dashboard/Admin/TagsPanel';
import TagsTab from '../../../../components/Dashboard/TagsTab';

export default function TagsPage() {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  return user?.role === 'admin' ? <TagsPanel /> : <div className="h-full overflow-y-auto pr-1"><TagsTab /></div>;
}
