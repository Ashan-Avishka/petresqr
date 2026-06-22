'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Users, ExternalLink, Dog, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../../../api/config';
import Link from 'next/link';
import { getAdminUsers, updateAdminUser, deleteAdminUser, getAdminUserPets } from '../../../api/admin-api';
import type { AdminUser, AdminPet, AdminPagination } from '../../../api/admin-types';
import SidePanel, {
  SidePanelTabs, DetailRow, PanelDivider, PanelActions,
  DangerButton, PrimaryButton, FieldLabel, FieldSelect,
} from './SidePanel';

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
      {active ? 'active' : 'inactive'}
    </span>
  );
}
function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${role === 'admin' ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 bg-gray-400/10'}`}>
      {role}
    </span>
  );
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

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Panel state
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [panelTab, setPanelTab] = useState<'Details' | 'Pets'>('Details');
  const [userPets, setUserPets] = useState<AdminPet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [petsError, setPetsError] = useState('');
  const [selectedPet, setSelectedPet] = useState<AdminPet | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [panelError, setPanelError] = useState('');

  const fetchUsers = (p: number, s: string) => {
    setLoading(true);
    getAdminUsers(p, s || undefined).then((r) => {
      if (r) { setUsers(r.data); setPagination(r.pagination); }
      setLoading(false);
    });
  };

  useEffect(() => { fetchUsers(page, search); }, [page, search]);

  // Load pets when switching to Pets tab
  useEffect(() => {
    if (panelTab === 'Pets' && selected) {
      setLoadingPets(true);
      setPetsError('');
      getAdminUserPets(selected._id).then(({ pets, error }) => {
        setUserPets(pets);
        if (error) setPetsError(error);
        setLoadingPets(false);
      });
    }
  }, [panelTab, selected]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(1), 300);
  };

  const openPanel = (u: AdminUser) => {
    setSelected(u); setEditing(false); setPanelTab('Details');
    setEditRole(u.role); setEditActive(u.isActive);
    setConfirmDelete(false); setPanelError(''); setUserPets([]); setPetsError(''); setSelectedPet(null);
  };
  const closePanel = () => { setSelected(null); setEditing(false); setConfirmDelete(false); setPanelError(''); };

  const handleToggle = async (u: AdminUser, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setToggling(true); setPanelError('');
    const updated = await updateAdminUser(u._id, { isActive: !u.isActive });
    setToggling(false);
    if (updated) {
      setUsers((prev) => prev.map((x) => x._id === updated._id ? updated : x));
      if (selected?._id === updated._id) setSelected(updated);
    } else setPanelError('Failed to update status.');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setPanelError('');
    const updated = await updateAdminUser(selected._id, { role: editRole, isActive: editActive });
    setSaving(false);
    if (updated) { setUsers((prev) => prev.map((u) => u._id === updated._id ? updated : u)); setSelected(updated); setEditing(false); }
    else setPanelError('Failed to update user.');
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    const ok = await deleteAdminUser(selected._id);
    setDeleting(false);
    if (ok) { setUsers((prev) => prev.filter((u) => u._id !== selected._id)); closePanel(); }
    else { setPanelError('Failed to delete user.'); setConfirmDelete(false); }
  };

  const panelOpen = !!selected;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none mb-4">
        <div className="hidden md:block mb-3">
          <h3 className="text-2xl font-bold text-white">Users</h3>
          <p className="text-gray-400 text-sm mt-0.5">{pagination ? `${pagination.total} total` : ''}</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={handleSearch} placeholder="Search by name or email…"
            className="w-full bg-black/40 border border-primary/20 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/60" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No users found</p>
            <p className="text-gray-400 text-sm">Try a different search</p>
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
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Email</th>}
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Role</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Provider</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Joined</th>}
                      <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} onClick={() => openPanel(u)}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${selected?._id === u._id ? 'bg-primary/10' : 'hover:bg-white/5'}`}>
                        <td className="px-4 py-2.5 text-white font-medium">{u.firstName} {u.lastName}</td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{u.email}</td>}
                        <td className="px-4 py-2.5"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-2.5"><StatusBadge active={u.isActive} /></td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 capitalize text-xs hidden md:table-cell">{u.authProvider}</td>}
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 text-xs hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>}
                        <td className="px-4 py-2.5 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleToggle(u, e)}
                              disabled={toggling && selected?._id === u._id}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-40 ${
                                u.isActive
                                  ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                                  : 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                              }`}>
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openPanel(u); }}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-colors">
                              View
                            </button>
                          </div>
                        </td>
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
              title={selected ? `${selected.firstName} ${selected.lastName}` : ''}
              subtitle={selected?.email}>
              {selected && (
                <>
                  <SidePanelTabs tabs={['Details', 'Pets']} active={panelTab} onChange={(t) => setPanelTab(t as 'Details' | 'Pets')} />

                  {/* ── Details tab ── */}
                  {panelTab === 'Details' && (
                    <>
                    <br></br>
                      <DetailRow label="Email" value={selected.email} />
                      <DetailRow label="Auth Provider" value={<span className="capitalize">{selected.authProvider}</span>} />
                      <DetailRow label="Email Verified" value={selected.emailVerified ? 'Yes' : 'No'} />
                      <DetailRow label="Joined" value={new Date(selected.createdAt).toLocaleString()} />
                      <DetailRow label="User ID" value={<span className="font-mono text-xs text-gray-400">{selected._id}</span>} />
                      <PanelDivider />

                      {editing ? (
                        <>
                          <div><FieldLabel>Role</FieldLabel>
                            <FieldSelect value={editRole} onChange={(v) => setEditRole(v as 'user' | 'admin')}
                              options={[{ label: 'User', value: 'user' }, { label: 'Admin', value: 'admin' }]} />
                          </div>
                          <div><FieldLabel>Status</FieldLabel>
                            <FieldSelect value={editActive ? 'active' : 'inactive'} onChange={(v) => setEditActive(v === 'active')}
                              options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
                          </div>
                          {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                          <PanelActions>
                            <button onClick={() => setEditing(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                            <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
                          </PanelActions>
                        </>
                      ) : confirmDelete ? (
                        <>
                          <p className="text-xs text-gray-300">Delete <span className="text-white font-semibold">{selected.firstName} {selected.lastName}</span>? This cannot be undone.</p>
                          {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                          <PanelActions>
                            <button onClick={() => setConfirmDelete(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                            <DangerButton onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Confirm Delete'}</DangerButton>
                          </PanelActions>
                        </>
                      ) : (
                        <>
                          <DetailRow label="Role" value={<RoleBadge role={selected.role} />} />
                          <DetailRow label="Status" value={<StatusBadge active={selected.isActive} />} />
                          {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                          {/* Quick toggle */}
                          <button onClick={() => handleToggle(selected)} disabled={toggling}
                            className={`w-full px-3 py-2 rounded-full text-xs font-medium border transition-all disabled:opacity-40 ${
                              selected.isActive
                                ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                                : 'bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20'
                            }`}>
                            {toggling ? 'Updating…' : selected.isActive ? 'Disable User' : 'Activate User'}
                          </button>
                          <PanelActions>
                            <DangerButton onClick={() => setConfirmDelete(true)}>Delete</DangerButton>
                            <PrimaryButton onClick={() => { setEditRole(selected.role); setEditActive(selected.isActive); setEditing(true); }}>Edit Role</PrimaryButton>
                          </PanelActions>
                        </>
                      )}
                    </>
                  )}

                  {/* ── Pets tab ── */}
                  {panelTab === 'Pets' && (
                    <>
                    <br></br>
                      {selectedPet ? (
                        /* ── Pet detail view ── */
                        <>
                          <button onClick={() => setSelectedPet(null)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-3">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to pets
                          </button>
                          {selectedPet.photoUrl && (
                            <div className="w-full aspect-video rounded-lg overflow-hidden bg-white/5 mb-3">
                              <img src={getImageUrl(selectedPet.photoUrl)} alt={selectedPet.name}
                                className="w-full h-full object-cover" />
                            </div>
                          )}
                          <DetailRow label="Name" value={selectedPet.name} />
                          <DetailRow label="Breed" value={selectedPet.breed} />
                          <DetailRow label="Type" value={<span className="capitalize">{selectedPet.type}</span>} />
                          <DetailRow label="Status" value={
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              selectedPet.status === 'active' ? 'text-green-400 bg-green-400/10' :
                              selectedPet.status === 'pending' ? 'text-amber-400 bg-amber-400/10' :
                              'text-red-400 bg-red-400/10'
                            }`}>{selectedPet.status}</span>
                          } />
                          <DetailRow label="Tag QR" value={<span className="font-mono text-xs">{(selectedPet as any).tagId?.qrCode ?? 'Not linked'}</span>} />
                          <DetailRow label="Pet ID" value={<span className="font-mono text-xs text-gray-400">{selectedPet._id ?? (selectedPet as any).id}</span>} />
                          <DetailRow label="Created" value={new Date(selectedPet.createdAt).toLocaleString()} />
                          <Link href={`/pet-gallery/${selectedPet._id ?? (selectedPet as any).id}`} target="_blank"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-colors w-full justify-center mt-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Public Pet Profile
                          </Link>
                        </>
                      ) : loadingPets ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                      ) : petsError ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Dog className="w-10 h-10 text-red-600/50 mb-2" />
                          <p className="text-red-400 text-sm font-medium">Failed to load pets</p>
                          <p className="text-gray-500 text-xs mt-1">{petsError}</p>
                          <button onClick={() => setPanelTab('Details')} className="mt-3 text-xs text-primary hover:underline">← Back to Details</button>
                        </div>
                      ) : userPets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <Dog className="w-10 h-10 text-gray-600 mb-2" />
                          <p className="text-gray-400 text-sm">No pets registered for this user</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {userPets.map((pet) => {
                            const petId = pet._id ?? (pet as any).id;
                            return (
                              <button key={petId} onClick={() => setSelectedPet(pet)}
                                className="w-full flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2.5 hover:bg-white/10 transition-colors text-left">
                                {/* Pet avatar */}
                                <div className="flex-none w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10">
                                  {pet.photoUrl ? (
                                    <img src={getImageUrl(pet.photoUrl)} alt={pet.name}
                                      className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Dog className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                {/* Pet info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{pet.name}</p>
                                  <p className="text-gray-400 text-xs truncate">{pet.breed} · <span className={`${
                                    pet.status === 'active' ? 'text-green-400' : pet.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                                  }`}>{pet.status}</span></p>
                                </div>
                                <ArrowLeft className="w-3.5 h-3.5 text-gray-500 rotate-180 flex-none" />
                              </button>
                            );
                          })}
                        </div>
                      )}
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
