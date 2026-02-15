import React, { useState } from 'react';
import { Tag, X, CheckCircle, XCircle, Link, Unlink, ChevronDown } from 'lucide-react';
import { useUserContext } from '../../contexts/UserContext';
import type { Tag as TagType } from '../../api/tag-types';

// ── Assign Modal ─────────────────────────────────────────────────────────────
interface AssignModalProps {
    tag: TagType;
    onClose: () => void;
    onAssign: (tagId: string, petId: string) => Promise<void>;
}

const AssignModal: React.FC<AssignModalProps> = ({ tag, onClose, onAssign }) => {
    const { pets } = useUserContext();
    const [selectedPetId, setSelectedPetId] = useState('');
    const [assigning, setAssigning] = useState(false);

    // Only show pets that are inactive and don't have active tags
    const eligiblePets = pets.filter(p => {
        const petId = p._id || p.id;
        if (tag.petId && tag.petId === petId) return false;
        // Only show pets with inactive status
        return p.status === 'inactive' && !p.tag.tagId;
    });

    const handleAssign = async () => {
        if (!selectedPetId) return;
        setAssigning(true);
        await onAssign(tag._id, selectedPetId);
        setAssigning(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white">Assign Tag to Pet</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-gray-400 mb-1">Tag ID</p>
                <p className="font-mono text-sm text-primary mb-5">
                    {tag.qrCode || 'Not yet assigned'}
                </p>

                {eligiblePets.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                        No eligible pets available. Only pets with inactive status can be assigned.
                    </p>
                ) : (
                    <>
                        <label className="block text-sm text-gray-400 mb-2">Select a pet (inactive pets only)</label>
                        <div className="relative mb-6">
                            <select
                                value={selectedPetId}
                                onChange={e => setSelectedPetId(e.target.value)}
                                className="w-full appearance-none bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="">-- Choose a pet --</option>
                                {eligiblePets.map(pet => (
                                    <option key={pet._id || pet.id} value={pet._id || pet.id}>
                                        {pet.name} {pet.breed ? `(${pet.breed})` : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedPetId || assigning}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {assigning ? 'Assigning…' : 'Assign'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass?: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title, message, confirmLabel, confirmClass, onConfirm, onClose
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
            <p className="text-sm text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 ${confirmClass ?? 'bg-primary text-black'}`}
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: TagType['status']; isActive: boolean }> = ({ status, isActive }) => {
    if (status === 'active' && isActive) {
        return (
            <span className="px-3 py-1 rounded-lg text-xs uppercase tracking-wide bg-black text-primary border border-primary shadow-sm shadow-primary">
                Active
            </span>
        );
    }
    if (status === 'active' && !isActive) {
        return (
            <span className="px-3 py-1 rounded-lg text-xs uppercase tracking-wide bg-gray-800 text-gray-400 border border-gray-600">
                Inactive
            </span>
        );
    }
    if (status === 'inactive') {
        return (
            <span className="px-3 py-1 rounded-lg text-xs uppercase tracking-wide bg-gray-800 text-gray-400 border border-gray-600">
                Inactive
            </span>
        );
    }
    if (status === 'pending') {
        return (
            <span className="px-3 py-1 rounded-lg text-xs uppercase tracking-wide bg-yellow-900/40 text-yellow-400 border border-yellow-600/50">
                Pending
            </span>
        );
    }
    return (
        <span className="px-3 py-1 rounded-lg text-xs uppercase tracking-wide bg-gray-800 text-gray-400 border border-gray-600">
            {status}
        </span>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
type ModalState =
    | { type: 'none' }
    | { type: 'assign'; tag: TagType }
    | { type: 'unassign'; tag: TagType }
    | { type: 'deactivate'; tag: TagType }
    | { type: 'activate'; tag: TagType };

const TagsTab: React.FC = () => {
    const { tags, pets, activateTag, deactivateTag, assignTag, unassignTag } = useUserContext();
    const [modal, setModal] = useState<ModalState>({ type: 'none' });
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const withLoading = async (tagId: string, fn: () => Promise<boolean>) => {
        setLoadingId(tagId);
        setErrorMsg(null);
        const ok = await fn();
        if (!ok) setErrorMsg('Action failed. Please try again.');
        setLoadingId(null);
        setModal({ type: 'none' });
    };

    const handleActivate = (tag: TagType) => {
        if (!tag.pet.id) {
            setErrorMsg('Assign this tag to a pet before activating.');
            return;
        }
        withLoading(tag._id, () => activateTag(tag._id));
    };

    const handleDeactivate = (tag: TagType) =>
        withLoading(tag._id, () => deactivateTag(tag._id));

    const handleAssign = async (tagId: string, petId: string) =>
        withLoading(tagId, () => assignTag(tagId, petId));

    const handleUnassign = (tag: TagType) =>
        withLoading(tag._id, () => unassignTag(tag._id));

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-4xl font-bold text-white">My Tags</h2>
                <p className="text-gray-400 mt-1">Manage your pet tracking tags</p>
            </div>

            {/* Error banner */}
            {errorMsg && (
                <div className="mb-4 flex items-center gap-2 bg-red-900/30 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tag list */}
            <div className="grid gap-4">
                {tags.map(tag => {
                    const isLoading = loadingId === tag._id;
                    const assignedPet = tag.pet;
                    const hasQRCode = !!tag.qrCode;

                    return (
                        <div
                            key={tag._id}
                            className="bg-gradient-to-br from-primary/10 via-black to-black border border-gray-800 rounded-2xl shadow-md p-5 hover:border-gray-700 transition-all"
                        >
                            {/* Top row: icon + info + status */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-black border border-gray-700 shadow-md shadow-primary/20 rounded-xl flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className='flex'>
                                        <h3 className="font-bold text-white font-mono text-sm mr-5">
                                            {hasQRCode ? tag.qrCode : 'Awaiting activation'}
                                        </h3>
                                        <p className="text-xs text-gray-500 border-r-1 border-gray-600 pr-2 mr-2">
                                            Purchased: {new Date(tag.createdAt).toLocaleDateString()}
                                        </p>
                                        {tag.activatedAt && (
                                            <p className="text-xs text-gray-500">
                                               Activated: {new Date(tag.activatedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <StatusBadge status={tag.status} isActive={tag.isActive} />
                            </div>

                            {/* Pet assignment info */}
                            <div className="mt-4 pl-[60px]">
                                {assignedPet?.name ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                                        <span>
                                            Assigned to{' '}
                                            <span className="text-white font-semibold">{assignedPet.name}</span>
                                            {assignedPet.breed && (
                                                <span className="text-gray-500"> · {assignedPet.breed}</span>
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        <span>Not assigned to any pet</span>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="mt-4 pl-[60px] flex flex-wrap gap-2">

                                {/* Activate — show when (pending OR inactive OR deactivated) AND has a pet */}
                                {(tag.status === 'pending' || tag.status === 'inactive' || !tag.isActive) && (
                                    <button
                                        // disabled={isLoading || !tag.petId}
                                        onClick={() => setModal({ type: 'activate', tag })}
                                        title={!tag.petId ? 'Assign to a pet first' : undefined}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Activate
                                    </button>
                                )}

                                {/* Deactivate — show when status=active and isActive=true */}
                                {tag.status === 'active' && tag.isActive && (
                                    <button
                                        disabled={isLoading}
                                        onClick={() => setModal({ type: 'deactivate', tag })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 text-xs font-semibold hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Deactivate
                                    </button>
                                )}

                                {/* Assign — show when no pet is linked */}
                                {!tag.petId && (
                                    <button
                                        disabled={isLoading || pets.filter(p => p.status === 'inactive' && !p.tag.tagId).length === 0}
                                        onClick={() => setModal({ type: 'assign', tag })}
                                        title={pets.filter(p => p.status === 'inactive').length === 0 ? 'No inactive pets available' : undefined}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 text-xs font-semibold hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Link className="w-3.5 h-3.5" />
                                        Assign to Pet
                                    </button>
                                )}

                                {/* Unassign — show when a pet is linked */}
                                {tag.petId && (
                                    <button
                                        disabled={isLoading}
                                        onClick={() => setModal({ type: 'unassign', tag })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400 text-xs font-semibold hover:bg-red-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Unlink className="w-3.5 h-3.5" />
                                        Unassign
                                    </button>
                                )}

                                {isLoading && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400">
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                        </svg>
                                        Working…
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {tags.length === 0 && (
                <div className="text-center py-16">
                    <Tag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No tags yet</h3>
                    <p className="text-gray-400">Purchase tags to track your pets</p>
                </div>
            )}

            {/* ── Modals ── */}

            {modal.type === 'assign' && (
                <AssignModal
                    tag={modal.tag}
                    onClose={() => setModal({ type: 'none' })}
                    onAssign={handleAssign}
                />
            )}

            {modal.type === 'unassign' && (
                <ConfirmModal
                    title="Unassign Tag"
                    message={`This will detach the tag from ${modal.tag.pet?.name ?? 'the pet'} and set that pet's status to inactive. Continue?`}
                    confirmLabel="Yes, Unassign"
                    confirmClass="bg-red-600 text-white"
                    onConfirm={() => handleUnassign(modal.tag)}
                    onClose={() => setModal({ type: 'none' })}
                />
            )}

            {modal.type === 'deactivate' && (
                <ConfirmModal
                    title="Deactivate Tag"
                    message={`This will set the tag to inactive${modal.tag.pet?.name ? ` and set ${modal.tag.pet.name}'s status to inactive` : ''}. It can be reactivated later.`}
                    confirmLabel="Deactivate"
                    confirmClass="bg-gray-600 text-white"
                    onConfirm={() => handleDeactivate(modal.tag)}
                    onClose={() => setModal({ type: 'none' })}
                />
            )}

            {modal.type === 'activate' && (
                <ConfirmModal
                    title="Activate Tag"
                    message={
                        modal.tag.qrCode
                            ? `Re-activate this tag for ${modal.tag.pet?.name ?? 'the assigned pet'}? The pet's status will be set to active.`
                            : `This will assign a physical QR code to this tag and activate it for ${modal.tag.pet?.name ?? 'the assigned pet'}. The pet's status will be set to active.`
                    }
                    confirmLabel="Activate"
                    confirmClass="bg-primary text-black"
                    onConfirm={() => handleActivate(modal.tag)}
                    onClose={() => setModal({ type: 'none' })}
                />
            )}
        </div>
    );
};

export default TagsTab;