'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { getAdminUsers } from '../../../api/admin-api';
import type { AdminUser, AdminPagination } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ active }: { active: boolean }) {
  const label = active ? 'active' : 'inactive';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[label]}`}>
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color = role === 'admin' ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 bg-gray-400/10';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{role}</span>;
}

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm"
      >
        Previous
      </button>
      <span className="text-gray-400 text-sm">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm"
      >
        Next
      </button>
    </div>
  );
}

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = (p: number, s: string) => {
    setLoading(true);
    getAdminUsers(p, s || undefined).then((result) => {
      if (result) {
        setUsers(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, val);
    }, 300);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Users</h3>
          <p className="text-gray-400 text-sm mt-1">
            {pagination ? `${pagination.total} total` : ''}
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search users..."
            className="bg-black/40 border border-primary/20 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/60 w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No users found</p>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Email</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Role</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Provider</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{u.authProvider}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={u.isActive} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <PaginationControls
                page={page}
                totalPages={pagination.pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pagination!.pages, p + 1))}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
