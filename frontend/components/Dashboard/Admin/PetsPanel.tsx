'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dog } from 'lucide-react';
import { getAdminPets } from '../../../api/admin-api';
import type { AdminPet, AdminPagination } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-red-400 bg-red-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'}`}>
      {status}
    </span>
  );
}

function Pagination({
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
      <button onClick={onPrev} disabled={page === 1} className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm">
        Previous
      </button>
      <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
      <button onClick={onNext} disabled={page >= totalPages} className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm">
        Next
      </button>
    </div>
  );
}

const STATUS_OPTIONS = ['', 'active', 'inactive', 'pending'];

export default function PetsPanel() {
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPets = (p: number, s: string) => {
    setLoading(true);
    getAdminPets(p, s || undefined).then((result) => {
      if (result) {
        setPets(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPets(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Pets</h3>
          <p className="text-gray-400 text-sm mt-1">
            {pagination ? `${pagination.total} total` : ''}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="bg-black/40 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16">
          <Dog className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No pets found</p>
          <p className="text-gray-400 text-sm">Try a different filter</p>
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
                <th className="text-left text-gray-400 font-medium px-4 py-3">Breed</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Tag QR</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{pet.name}</td>
                  <td className="px-4 py-3 text-gray-300">{pet.breed}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {pet.ownerId
                      ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {pet.tagId?.qrCode ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={pet.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(pet.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={pagination.pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
