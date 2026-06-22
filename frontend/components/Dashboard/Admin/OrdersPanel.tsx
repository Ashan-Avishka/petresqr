'use client';

import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag, Tag, MapPin } from 'lucide-react';
import { getAdminOrders, getAdminOrderById, updateAdminOrderStatus } from '../../../api/admin-api';
import type { AdminOrder, AdminPagination, OrderStatus } from '../../../api/admin-types';
import { getImageUrl } from '../../../api/config';
import SidePanel, {
  DetailRow, PanelDivider, PanelActions, PrimaryButton,
  FieldLabel, FieldSelect, FieldInput, SidePanelTabs,
} from './SidePanel';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-green-400 bg-green-400/10',
  paid: 'text-green-400 bg-green-400/10',
  processing: 'text-amber-400 bg-amber-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  shipped: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
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

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [fullOrder, setFullOrder] = useState<AdminOrder | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [activeTab, setActiveTab] = useState('Details');
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [editTracking, setEditTracking] = useState('');
  const [saving, setSaving] = useState(false);
  const [panelError, setPanelError] = useState('');

  const fetchOrders = (p: number, s: string) => {
    setLoading(true);
    getAdminOrders(p, s || undefined).then((result) => {
      if (result) { setOrders(result.data); setPagination(result.pagination); }
      setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(page, statusFilter); }, [page, statusFilter]);

  const openPanel = (order: AdminOrder) => {
    setSelected(order); setFullOrder(null); setEditing(false); setActiveTab('Details');
    setEditStatus(order.status); setEditTracking(order.trackingNumber ?? '');
    setPanelError('');
    setLoadingFull(true);
    getAdminOrderById(order._id).then((full) => {
      setFullOrder(full);
      setLoadingFull(false);
    });
  };
  const closePanel = () => { setSelected(null); setFullOrder(null); setEditing(false); setPanelError(''); };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setPanelError('');
    const updated = await updateAdminOrderStatus(selected._id, editStatus, editTracking || undefined);
    setSaving(false);
    if (updated) { setOrders((prev) => prev.map((o) => o._id === updated._id ? updated : o)); setSelected(updated); setEditing(false); }
    else setPanelError('Failed to update order.');
  };

  const panelOpen = !!selected;

  const filtered = search.trim()
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        const name = o.userId ? `${o.userId.firstName} ${o.userId.lastName}`.toLowerCase() : '';
        const pet = o.petId?.name?.toLowerCase() ?? '';
        const id = o._id.toLowerCase();
        return name.includes(q) || pet.includes(q) || id.includes(q);
      })
    : orders;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none mb-4">
        <div className="hidden md:block mb-3">
          <h3 className="text-2xl font-bold text-white">All Orders</h3>
          <p className="text-gray-400 text-sm mt-0.5">{pagination ? `${pagination.total} total` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, pet, or order ID…"
              className="w-full bg-black/40 border border-primary/20 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/60"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-none bg-black/40 border border-primary/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60">
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No orders found</p>
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
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Order ID</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Customer</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Pet</th>}
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3">Total</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Date</th>}
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order._id} onClick={() => openPanel(order)}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${selected?._id === order._id ? 'bg-primary/10' : 'hover:bg-white/5'}`}>
                        <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-2.5 text-white text-xs hidden md:table-cell">{order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : '—'}</td>
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{order.petId?.name ?? '—'}</td>}
                        <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                        {!panelOpen && <td className="px-4 py-2.5 text-white font-medium">${order.total.toFixed(2)}</td>}
                        {!panelOpen && <td className="px-4 py-2.5 text-gray-400 text-xs hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>}
                        {!panelOpen && (
                          <td className="px-4 py-2.5 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); openPanel(order); setEditing(true); }}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors">
                                Update
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); openPanel(order); }}
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
              title={selected ? `Order #${selected._id.slice(-8).toUpperCase()}` : ''}
              subtitle={selected?.userId ? `${selected.userId.firstName} ${selected.userId.lastName}` : undefined}>
              {selected && (
                <>
                  <SidePanelTabs
                    tabs={['Details', 'Items', 'Shipping']}
                    active={activeTab}
                    onChange={setActiveTab}
                  />

                  {/* ── Details tab ── */}
                  {activeTab === 'Details' && (
                    <>
                    <br></br>
                      <DetailRow label="Order ID" value={<span className="font-mono text-xs text-gray-400">{selected._id}</span>} />
                      <DetailRow label="Customer" value={selected.userId ? `${selected.userId.firstName} ${selected.userId.lastName}` : '—'} />
                      <DetailRow label="Email" value={selected.userId?.email ?? '—'} />
                      <DetailRow label="Phone" value={selected.userId?.phone ?? '—'} />
                      <DetailRow label="Pet" value={selected.petId ? `${selected.petId.name} (${selected.petId.breed})` : '—'} />
                      <DetailRow label="Tag QR" value={<span className="font-mono text-xs">{selected.tagId?.qrCode ?? '—'}</span>} />
                      <DetailRow label="Payment" value={fullOrder?.paymentMethod ?? '—'} />
                      <DetailRow label="Created" value={new Date(selected.createdAt).toLocaleString()} />

                      <PanelDivider />

                      <div className="space-y-1.5">
                        {[
                          { label: 'Subtotal', value: fullOrder?.subtotal != null ? `$${fullOrder.subtotal.toFixed(2)}` : '—' },
                          { label: 'Shipping', value: fullOrder?.shipping != null ? `$${fullOrder.shipping.toFixed(2)}` : '—' },
                          { label: 'Tax', value: fullOrder?.tax != null ? `$${fullOrder.tax.toFixed(2)}` : '—' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between text-xs">
                            <span className="text-gray-500">{label}</span>
                            <span className="text-gray-300">{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-1.5">
                          <span className="text-white">Total</span>
                          <span className="text-white">${selected.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <PanelDivider />

                      {editing ? (
                        <>
                          <div><FieldLabel>Status</FieldLabel>
                            <FieldSelect value={editStatus} onChange={(v) => setEditStatus(v as OrderStatus)}
                              options={ALL_STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))} />
                          </div>
                          <div><FieldLabel>Tracking Number (optional)</FieldLabel>
                            <FieldInput value={editTracking} onChange={setEditTracking} placeholder="e.g. 1Z999AA1..." />
                          </div>
                          {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                          <PanelActions>
                            <button onClick={() => setEditing(false)} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                            <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
                          </PanelActions>
                        </>
                      ) : (
                        <>
                          <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
                          <DetailRow label="Tracking" value={selected.trackingNumber ?? '—'} />
                          {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                          <PanelActions>
                            <PrimaryButton onClick={() => { setEditing(true); setPanelError(''); }}>Update Status</PrimaryButton>
                          </PanelActions>
                        </>
                      )}
                    </>
                  )}

                  {/* ── Items tab ── */}
                  {activeTab === 'Items' && (
                    <>
                    <br></br>
                      {loadingFull ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                      ) : fullOrder?.items && fullOrder.items.length > 0 ? (
                        <div className="space-y-3">
                          {fullOrder.items.map((item, i) => (
                            <div key={i} className="flex gap-3 bg-white/5 rounded-lg p-3">
                              <div className="w-14 h-14 flex-none rounded-lg overflow-hidden bg-white/10 border border-white/10">
                                {item.image ? (
                                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-primary/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                {item.sku && <p className="text-gray-500 text-[10px] font-mono">{item.sku}</p>}
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {item.size && <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Size: {item.size}</span>}
                                  {item.color && <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Color: {item.color}</span>}
                                  <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right flex-none">
                                <p className="text-white text-xs font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-gray-500 text-[10px]">${item.price.toFixed(2)} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">No items found</div>
                      )}
                    </>
                  )}

                  {/* ── Shipping tab ── */}
                  {activeTab === 'Shipping' && (
                    <>
                    <br></br>
                      {loadingFull ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                      ) : fullOrder?.shippingAddress ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-white text-xs font-semibold">Shipping Address</span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm text-gray-300">
                            <p>{fullOrder.shippingAddress.street}</p>
                            <p>{fullOrder.shippingAddress.city}, {fullOrder.shippingAddress.state} {fullOrder.shippingAddress.zipCode}</p>
                            <p>{fullOrder.shippingAddress.country}</p>
                          </div>
                          {selected.trackingNumber && (
                            <DetailRow label="Tracking Number" value={<span className="font-mono text-xs">{selected.trackingNumber}</span>} />
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">No shipping info</div>
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
