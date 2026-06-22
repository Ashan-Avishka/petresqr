'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dog, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '../../../api/config';
import { getAdminPets, updateAdminPet, deleteAdminPet } from '../../../api/admin-api';
import type { AdminPet, AdminPagination } from '../../../api/admin-types';
import SidePanel, {
  DetailRow, PanelDivider, PanelActions, DangerButton, PrimaryButton,
  FieldLabel, FieldInput, FieldSelect,
} from './SidePanel';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-red-400 bg-red-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'}`}>{status}</span>;
}

function Pagination({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <button onClick={onPrev} disabled={page === 1} className="px-3 py-1.5 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-xs">Prev</button>
      <span className="text-gray-400 text-xs">Page {page} of {totalPages}</span>
      <button onClick={onNext} disabled={page >= totalPages} className="px-3 py-1.5 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-xs">Next</button>
    </div>
  );
}

const STATUS_OPTIONS = ['active', 'inactive', 'pending'];

export default function PetsPanel() {
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<AdminPet | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [panelError, setPanelError] = useState('');

  const fetchPets = (p: number, s: string, q: string) => {
    setLoading(true);
    getAdminPets(p, s || undefined, q || undefined).then((r) => {
      if (r) { setPets(r.data); setPagination(r.pagination); }
      setLoading(false);
    });
  };

  useEffect(() => { fetchPets(page, statusFilter, search); }, [page, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPets(1, statusFilter, e.target.value);
    }, 350);
  };

  const openPanel = (pet: AdminPet) => {
    setSelected(pet); setEditing(false);
    setEditName(pet.name); setEditBreed(pet.breed); setEditStatus(pet.status);
    setConfirmDelete(false); setPanelError('');
  };
  const closePanel = () => { setSelected(null); setEditing(false); setConfirmDelete(false); setPanelError(''); };


  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setPanelError('');
    const updated = await updateAdminPet(selected._id, { name: editName, breed: editBreed, status: editStatus });
    setSaving(false);
    if (updated) { setPets((prev) => prev.map((p) => p._id === updated._id ? updated : p)); setSelected(updated); setEditing(false); }
    else setPanelError('Failed to update pet.');
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    const ok = await deleteAdminPet(selected._id);
    setDeleting(false);
    if (ok) { setPets((prev) => prev.filter((p) => p._id !== selected._id)); closePanel(); }
    else { setPanelError('Failed to delete pet.'); setConfirmDelete(false); }
  };

  const panelOpen = !!selected;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none mb-4">
        <div className="hidden md:block mb-3">
          <h3 className="text-2xl font-bold text-white">Pets</h3>
          <p className="text-gray-400 text-sm mt-0.5">{pagination ? `${pagination.total} total` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by pet name…"
              className="w-full bg-black/40 border border-primary/20 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/60"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-none bg-black/40 border border-primary/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary" />
          </div>
        ) : pets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Dog className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No pets found</p>
            <p className="text-gray-400 text-sm">Try a different filter</p>
          </div>
        ) : (
          <div className="h-full flex overflow-hidden rounded-xl border border-primary/20 bg-black/40 backdrop-blur-md">
            {/* Table section */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#111] z-10">
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Name</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Owner</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Breed</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3">Type</th>}
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Created</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pets.map((pet) => (
                      <tr key={pet._id ?? pet.id} onClick={() => openPanel(pet)}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${(selected?._id ?? selected?.id) === (pet._id ?? pet.id) ? 'bg-primary/10' : 'hover:bg-white/5'}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-none w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10">
                              {pet.photoUrl ? (
                                <img src={getImageUrl(pet.photoUrl)} alt={pet.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Dog className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <span className="text-white font-medium text-sm">{pet.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : '—'}</td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{pet.breed}</td>}
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 capitalize text-xs">{pet.type}</td>}
                        <td className="px-4 py-2.5"><StatusBadge status={pet.status} /></td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 text-xs hidden md:table-cell">{new Date(pet.createdAt).toLocaleDateString()}</td>}
                        {!panelOpen && (
                          <td className="px-4 py-2.5 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <Link href={`/pet-gallery/${pet._id}`} target="_blank" onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Profile
                              </Link>
                              <button onClick={(e) => { e.stopPropagation(); openPanel(pet); }}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-colors">
                                View
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="flex-none border-t border-white/10">
                  <Pagination page={page} totalPages={pagination.pages}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))} />
                </div>
              )}
            </div>

            {/* Side panel */}
            <SidePanel open={panelOpen} onClose={closePanel}
              title={selected?.name ?? ''}
              subtitle={selected ? `${selected.breed} · ${selected.type}` : undefined}>
              {selected && (
                <>
                  {/* Pet photo */}
                  {selected.photoUrl && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-white/5 mb-1">
                      <img src={getImageUrl(selected.photoUrl)} alt={selected.name}
                        className="w-full h-full object-cover" />
                    </div>
                  )}

                  <DetailRow label="Pet ID" value={<span className="font-mono text-xs text-gray-400">{selected._id}</span>} />
                  <DetailRow label="Owner" value={selected.ownerId ? `${selected.ownerId.firstName} ${selected.ownerId.lastName}` : '—'} />
                  <DetailRow label="Owner Email" value={selected.ownerId?.email ?? '—'} />
                  <DetailRow label="Tag QR" value={<span className="font-mono text-xs">{selected.tagId?.qrCode ?? 'Not linked'}</span>} />
                  <DetailRow label="Created" value={new Date(selected.createdAt).toLocaleString()} />

                  <Link href={`/pet-gallery/${selected._id ?? selected.id}`} target="_blank"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-colors w-full justify-center">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Public Pet Profile
                  </Link>

                  <PanelDivider />

                  {editing ? (
                    <>
                      <div><FieldLabel>Name</FieldLabel>
                        <FieldInput value={editName} onChange={setEditName} placeholder="Pet name" />
                      </div>
                      <div><FieldLabel>Breed</FieldLabel>
                        <FieldInput value={editBreed} onChange={setEditBreed} placeholder="Breed" />
                      </div>
                      <div><FieldLabel>Status</FieldLabel>
                        <FieldSelect value={editStatus} onChange={setEditStatus}
                          options={STATUS_OPTIONS.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))} />
                      </div>
                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <button onClick={() => setEditing(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                        <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
                      </PanelActions>
                    </>
                  ) : confirmDelete ? (
                    <>
                      <p className="text-xs text-gray-300">Delete <span className="text-white font-semibold">{selected.name}</span>? This cannot be undone.</p>
                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                        <DangerButton onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Confirm Delete'}</DangerButton>
                      </PanelActions>
                    </>
                  ) : (
                    <>
                      <DetailRow label="Name" value={selected.name} />
                      <DetailRow label="Breed" value={selected.breed} />
                      <DetailRow label="Type" value={<span className="capitalize">{selected.type}</span>} />
                      <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <DangerButton onClick={() => setConfirmDelete(true)}>Delete</DangerButton>
                        <PrimaryButton onClick={() => { setEditing(true); setPanelError(''); }}>Edit</PrimaryButton>
                      </PanelActions>
                    </>
                  )}
                </>
              )}
            </SidePanel>
          </div>
        )}
      </div>
    </div>
  );
}
