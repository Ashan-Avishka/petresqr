'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Tag } from 'lucide-react';
import { getImageUrl } from '../../../api/config';
import { getAdminTags, updateAdminTag, deleteAdminTag } from '../../../api/admin-api';
import type { AdminTag, AdminPagination } from '../../../api/admin-types';
import SidePanel, {
  DetailRow, PanelDivider, PanelActions, DangerButton, PrimaryButton,
  FieldLabel, FieldSelect,
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

export default function TagsPanel() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<AdminTag | null>(null);
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'pending'>('pending');
  const [editActive, setEditActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [panelError, setPanelError] = useState('');

  const fetchTags = (p: number, s: string, q: string) => {
    setLoading(true); setFetchError('');
    getAdminTags(p, s || undefined, q || undefined).then((result) => {
      if (result) { setTags(result.data); setPagination(result.pagination); }
      else setFetchError('Failed to load tags. The /admin/tags endpoint may not be available.');
      setLoading(false);
    });
  };

  useEffect(() => { fetchTags(page, statusFilter, search); }, [page, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchTags(1, statusFilter, e.target.value);
    }, 350);
  };

  const openPanel = (tag: AdminTag) => {
    setSelected(tag); setEditing(false);
    setEditStatus(tag.status); setEditActive(tag.isActive);
    setConfirmDelete(false); setPanelError('');
  };
  const closePanel = () => { setSelected(null); setEditing(false); setConfirmDelete(false); setPanelError(''); };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setPanelError('');
    const updated = await updateAdminTag(selected._id, { status: editStatus, isActive: editActive });
    setSaving(false);
    if (updated) { setTags((prev) => prev.map((t) => t._id === updated._id ? updated : t)); setSelected(updated); setEditing(false); }
    else setPanelError('Failed to update tag.');
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    const ok = await deleteAdminTag(selected._id);
    setDeleting(false);
    if (ok) { setTags((prev) => prev.filter((t) => t._id !== selected._id)); closePanel(); }
    else { setPanelError('Failed to delete tag.'); setConfirmDelete(false); }
  };

  const panelOpen = !!selected;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none mb-4">
        <div className="hidden md:block mb-3">
          <h3 className="text-2xl font-bold text-white">Tags</h3>
          <p className="text-gray-400 text-sm mt-0.5">{pagination ? `${pagination.total} total` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by QR code…"
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
        ) : fetchError ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">Could not load tags</p>
            <p className="text-gray-400 text-sm mt-1 text-center max-w-xs">{fetchError}</p>
            <button onClick={() => fetchTags(page, statusFilter, search)} className="mt-4 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors">Retry</button>
          </div>
        ) : tags.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-white font-semibold">No tags found</p>
            <p className="text-gray-400 text-sm">Try a different filter or search</p>
          </div>
        ) : (
          <div className="h-full flex overflow-hidden rounded-xl border border-primary/20 bg-black/40 backdrop-blur-md">
            {/* Table section */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#111] z-10">
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Tag</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Owner</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Pet</th>}
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Activated</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Created</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tags.map((tag) => (
                      <tr key={tag._id} onClick={() => openPanel(tag)}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${selected?._id === tag._id ? 'bg-primary/10' : 'hover:bg-white/5'}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-none w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/10">
                              {tag.productImage
                                ? <img src={getImageUrl(tag.productImage)} alt="tag" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Tag className="w-4 h-4 text-primary" /></div>
                              }
                            </div>
                            <span className="font-mono text-xs text-white">{tag.qrCode ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{tag.userId ? `${tag.userId.firstName} ${tag.userId.lastName}` : '—'}</td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{tag.petId?.name ?? '—'}</td>}
                        <td className="px-4 py-2.5"><StatusBadge status={tag.status} /></td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 text-xs hidden md:table-cell">{tag.activatedAt ? new Date(tag.activatedAt).toLocaleDateString() : '—'}</td>}
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 text-xs hidden md:table-cell">{new Date(tag.createdAt).toLocaleDateString()}</td>}
                        {!panelOpen && (
                          <td className="px-4 py-2.5 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); openPanel(tag); setEditing(true); }}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors">
                                Edit
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); openPanel(tag); }}
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
              title={selected?.qrCode ? `Tag ${selected.qrCode}` : 'Tag Details'}
              subtitle={selected?.userId ? `${selected.userId.firstName} ${selected.userId.lastName}` : undefined}>
              {selected && (
                <>
                  {/* Tag product image */}
                  {selected.productImage && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-white/5 mb-1">
                      <img src={getImageUrl(selected.productImage)} alt="Tag product"
                        className="w-full h-full object-cover" />
                    </div>
                  )}

                  <DetailRow label="Tag ID" value={<span className="font-mono text-xs text-gray-400">{selected._id}</span>} />
                  <DetailRow label="QR Code" value={<span className="font-mono text-sm">{selected.qrCode ?? '—'}</span>} />
                  <DetailRow label="Owner" value={selected.userId ? `${selected.userId.firstName} ${selected.userId.lastName}` : '—'} />
                  <DetailRow label="Owner Email" value={selected.userId?.email ?? '—'} />
                  <DetailRow label="Pet" value={selected.petId ? `${selected.petId.name} — ${selected.petId.breed}` : '—'} />
                  <DetailRow label="Purchase Date" value={selected.purchaseDate ? new Date(selected.purchaseDate).toLocaleString() : '—'} />
                  <DetailRow label="Activated" value={selected.activatedAt ? new Date(selected.activatedAt).toLocaleString() : '—'} />
                  <DetailRow label="Created" value={new Date(selected.createdAt).toLocaleString()} />

                  <PanelDivider />

                  {editing ? (
                    <>
                      <div><FieldLabel>Status</FieldLabel>
                        <FieldSelect value={editStatus} onChange={(v) => setEditStatus(v as 'active' | 'inactive' | 'pending')}
                          options={STATUS_OPTIONS.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))} />
                      </div>
                      <div><FieldLabel>Active</FieldLabel>
                        <FieldSelect value={editActive ? 'true' : 'false'} onChange={(v) => setEditActive(v === 'true')}
                          options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]} />
                      </div>
                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <button onClick={() => setEditing(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                        <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
                      </PanelActions>
                    </>
                  ) : confirmDelete ? (
                    <>
                      <p className="text-xs text-gray-300">Delete tag <span className="text-white font-semibold font-mono">{selected.qrCode}</span>? This cannot be undone.</p>
                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                        <DangerButton onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Confirm Delete'}</DangerButton>
                      </PanelActions>
                    </>
                  ) : (
                    <>
                      <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
                      <DetailRow label="Active" value={selected.isActive ? 'Yes' : 'No'} />
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
