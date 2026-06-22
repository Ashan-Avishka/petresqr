'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Dog, ExternalLink, Tag, User } from 'lucide-react';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { getImageUrl } from '../../../../../api/config';
import { getAdminPetById, updateAdminPet, deleteAdminPet } from '../../../../../api/admin-api';
import type { AdminPet } from '../../../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10 border-green-400/30',
  inactive: 'text-red-400 bg-red-400/10 border-red-400/30',
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
};

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();
  const isAdmin = user?.role === 'admin';

  const [pet, setPet] = useState<AdminPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard/pets'); return; }
    getAdminPetById(id).then((data) => {
      if (data) { setPet(data); setEditName(data.name); setEditBreed(data.breed); setEditStatus(data.status); }
      else setNotFound(true);
      setLoading(false);
    });
  }, [id, authLoading, isAdmin]);

  const handleSave = async () => {
    if (!pet) return;
    setSaving(true); setError('');
    const updated = await updateAdminPet(pet._id ?? (pet as any).id, { name: editName, breed: editBreed, status: editStatus });
    setSaving(false);
    if (updated) { setPet(updated); setEditing(false); }
    else setError('Failed to save changes.');
  };

  const handleDelete = async () => {
    if (!pet) return;
    setDeleting(true);
    const ok = await deleteAdminPet(pet._id ?? (pet as any).id);
    if (ok) router.replace('/dashboard/pets');
    else { setError('Failed to delete pet.'); setDeleting(false); setConfirmDelete(false); }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
      </div>
    );
  }

  if (notFound || !pet) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <Dog className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Pet not found</h2>
        <p className="text-gray-400 mb-6">This pet may have been deleted or the ID is invalid.</p>
        <Link href="/dashboard/pets" className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
          Back to Pets
        </Link>
      </div>
    );
  }

  const petId = pet._id ?? (pet as any).id;
  const statusClass = STATUS_COLORS[pet.status] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/30';

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Back nav */}
      <div className="flex-none flex items-center gap-3 mb-6">
        <Link href="/dashboard/pets"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Pets
        </Link>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Photo + quick info */}
        <div className="flex-none w-72 space-y-4">
          <div className="rounded-2xl overflow-hidden bg-white/5 border border-primary/20 aspect-square">
            {pet.photoUrl ? (
              <img src={getImageUrl(pet.photoUrl)} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <Dog className="w-16 h-16 text-gray-600" />
                <span className="text-gray-500 text-sm">No photo</span>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>{pet.status}</span>
            {pet.isActive && <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-400/30 text-green-400 bg-green-400/10">active</span>}
          </div>

          {/* Public profile link */}
          <Link href={`/pet-gallery/${petId}`} target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/20 transition-colors w-full">
            <ExternalLink className="w-4 h-4" /> Public Profile
          </Link>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-primary/20 p-5">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Breed</label>
                  <input value={editBreed} onChange={(e) => setEditBreed(e.target.value)}
                    className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60">
                    {['active', 'inactive', 'pending'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { setEditing(false); setError(''); }}
                    className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 px-3 py-2 bg-gradient-to-br from-primary via-black to-black border border-primary/70 text-white rounded-full text-xs hover:shadow-primary/30 hover:shadow-md transition-all disabled:opacity-40">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{pet.name}</h1>
                  <p className="text-gray-400 mt-1 capitalize">{pet.breed} · {pet.type}</p>
                </div>
                <button onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-gradient-to-br from-primary via-black to-black border border-primary/70 text-white rounded-full text-sm hover:shadow-primary/30 hover:shadow-md transition-all">
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Owner */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-primary/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-white font-semibold text-sm">Owner</h3>
            </div>
            {pet.ownerId ? (
              <div className="space-y-1.5">
                <p className="text-white">{pet.ownerId.firstName} {pet.ownerId.lastName}</p>
                <p className="text-gray-400 text-sm">{pet.ownerId.email}</p>
                <Link href="/dashboard/users"
                  className="inline-flex items-center gap-1 text-primary text-xs hover:underline mt-1">
                  View in Users panel
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No owner assigned</p>
            )}
          </div>

          {/* Tag */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-primary/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-primary" />
              <h3 className="text-white font-semibold text-sm">Linked Tag</h3>
            </div>
            {pet.tagId ? (
              <div className="space-y-1.5">
                <p className="text-white font-mono">{pet.tagId.qrCode}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[pet.tagId.status] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
                  {pet.tagId.status}
                </span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tag linked</p>
            )}
          </div>

          {/* Meta */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-primary/20 p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { label: 'Pet ID', value: <span className="font-mono text-xs text-gray-400">{petId}</span> },
                { label: 'Created', value: new Date(pet.createdAt).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
                  <p className="text-white text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
            <h3 className="text-red-400 font-semibold text-sm mb-2">Danger Zone</h3>
            {confirmDelete ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Delete <span className="text-white font-semibold">{pet.name}</span>? This cannot be undone.</p>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/40 text-red-400 rounded-full text-xs hover:bg-red-500/20 transition-colors disabled:opacity-40">
                    {deleting ? 'Deleting…' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-sm hover:bg-red-500/20 transition-colors">
                Delete Pet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
