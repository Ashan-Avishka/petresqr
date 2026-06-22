'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, ShoppingBag, Plus, X, Palette } from 'lucide-react';
import { getImageUrl } from '../../../api/config';
import { getAdminProducts, updateAdminProduct } from '../../../api/admin-api';
import type { AdminProduct, AdminPagination } from '../../../api/admin-types';
import SidePanel, {
  DetailRow, PanelDivider, PanelActions, PrimaryButton,
  FieldLabel, FieldInput, FieldSelect,
} from './SidePanel';

const AVAILABILITY_OPTIONS = [
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
  { label: 'Pre-Order', value: 'pre_order' },
  { label: 'Discontinued', value: 'discontinued' },
];

const BADGE_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Bestseller', value: 'bestseller' },
  { label: 'New', value: 'new' },
  { label: 'Sale', value: 'sale' },
  { label: 'Limited', value: 'limited' },
];

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Tag', value: 'tag' },
  { label: 'Accessory', value: 'accessory' },
  { label: 'Bundle', value: 'bundle' },
  { label: 'Merchandise', value: 'merchandise' },
];

const AVAIL_COLORS: Record<string, string> = {
  in_stock: 'text-green-400 bg-green-400/10',
  out_of_stock: 'text-red-400 bg-red-400/10',
  pre_order: 'text-amber-400 bg-amber-400/10',
  discontinued: 'text-gray-400 bg-gray-400/10',
};

function AvailBadge({ availability }: { availability: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${AVAIL_COLORS[availability] ?? 'text-gray-400 bg-gray-400/10'}`}>
      {availability.replace('_', ' ')}
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

export default function ProductsPanel() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [panelError, setPanelError] = useState('');

  // Edit state
  const [editAvailability, setEditAvailability] = useState<AdminProduct['availability']>('in_stock');
  const [editStock, setEditStock] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editComparePrice, setEditComparePrice] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [editSizes, setEditSizes] = useState<string[]>([]);
  const [editColors, setEditColors] = useState<Array<{ name: string; hexCode: string }>>([]);
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#ffffff');

  const fetchProducts = (p: number, cat: string, q: string) => {
    setLoading(true); setFetchError('');
    getAdminProducts(p, q || undefined, cat || undefined).then((result) => {
      if (result) { setProducts(result.data); setPagination(result.pagination); }
      else setFetchError('Failed to load products.');
      setLoading(false);
    });
  };

  useEffect(() => { fetchProducts(page, categoryFilter, search); }, [page, categoryFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, categoryFilter, e.target.value);
    }, 350);
  };

  const openPanel = (product: AdminProduct) => {
    setSelected(product); setEditing(false); setPanelError('');
    setEditAvailability(product.availability);
    setEditStock(String(product.stock));
    setEditPrice(String(product.price));
    setEditComparePrice(product.compareAtPrice ? String(product.compareAtPrice) : '');
    setEditBadge(product.badge ?? '');
    setEditFeatured(product.isFeatured);
    setEditActive(product.isActive);
    setEditSizes([...(product.availableSizes ?? [])]);
    setEditColors([...(product.availableColors ?? [])]);
  };

  const closePanel = () => { setSelected(null); setEditing(false); setPanelError(''); };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setPanelError('');
    const updated = await updateAdminProduct(selected._id, {
      availability: editAvailability,
      stock: Number(editStock),
      price: Number(editPrice),
      compareAtPrice: editComparePrice ? Number(editComparePrice) : undefined,
      badge: (editBadge as AdminProduct['badge']) || undefined,
      isFeatured: editFeatured,
      isActive: editActive,
      availableSizes: editSizes,
      availableColors: editColors,
    });
    setSaving(false);
    if (updated) {
      setProducts((prev) => prev.map((p) => p._id === updated._id ? updated : p));
      setSelected(updated);
      setEditing(false);
    } else {
      setPanelError('Failed to save changes.');
    }
  };

  const addSize = () => {
    const s = newSize.trim();
    if (s && !editSizes.includes(s)) { setEditSizes([...editSizes, s]); }
    setNewSize('');
  };

  const addColor = () => {
    const n = newColorName.trim();
    if (n && !editColors.find(c => c.name.toLowerCase() === n.toLowerCase())) {
      setEditColors([...editColors, { name: n, hexCode: newColorHex }]);
    }
    setNewColorName(''); setNewColorHex('#ffffff');
  };

  const panelOpen = !!selected;
  const primaryImage = selected?.images?.find(i => i.isPrimary)?.url ?? selected?.images?.[0]?.url;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none mb-4">
        <div className="hidden md:block mb-3">
          <h3 className="text-2xl font-bold text-white">Products</h3>
          <p className="text-gray-400 text-sm mt-0.5">{pagination ? `${pagination.total} total` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text" value={search} onChange={handleSearch}
              placeholder="Search by name or SKU…"
              className="w-full bg-black/40 border border-primary/20 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/60"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="flex-none bg-black/40 border border-primary/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60">
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">Could not load products</p>
            <p className="text-gray-400 text-sm mt-1 text-center max-w-xs">{fetchError}</p>
            <button onClick={() => fetchProducts(page, categoryFilter, search)} className="mt-4 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors">Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-white font-semibold">No products found</p>
            <p className="text-gray-400 text-sm">Try a different filter or search</p>
          </div>
        ) : (
          <div className="h-full flex overflow-hidden rounded-xl border border-primary/20 bg-black/40 backdrop-blur-md">
            {/* Table */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#111] z-10">
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Product</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">SKU</th>}
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Price</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Stock</th>
                      <th className="text-left text-gray-400 font-medium px-4 py-3">Availability</th>
                      {!panelOpen && <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const thumb = product.images?.find(i => i.isPrimary)?.url ?? product.images?.[0]?.url;
                      return (
                        <tr key={product._id} onClick={() => openPanel(product)}
                          className={`border-b border-white/5 cursor-pointer transition-colors ${selected?._id === product._id ? 'bg-primary/10' : 'hover:bg-white/5'}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-none w-10 h-10 rounded-lg overflow-hidden bg-white/10 border border-white/10">
                                {thumb
                                  ? <img src={getImageUrl(thumb)} alt={product.name} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-primary" /></div>
                                }
                              </div>
                              <div>
                                <p className="text-white text-xs font-medium truncate max-w-[120px]">{product.name}</p>
                                <p className="text-gray-500 text-[10px] capitalize">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          {!panelOpen && <td className="px-4 py-2.5 text-gray-400 text-xs font-mono hidden md:table-cell">{product.sku}</td>}
                          <td className="px-4 py-2.5 text-white text-xs">${product.price.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-gray-300 text-xs hidden md:table-cell">{product.stock}</td>
                          <td className="px-4 py-2.5"><AvailBadge availability={product.availability} /></td>
                          {!panelOpen && (
                            <td className="px-4 py-2.5 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                              <button onClick={(e) => { e.stopPropagation(); openPanel(product); setEditing(true); }}
                                className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors">
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
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
              title={selected?.name ?? 'Product'}
              subtitle={selected?.sku}>
              {selected && (
                <>
                  {primaryImage && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-white/5 mb-1">
                      <img src={getImageUrl(primaryImage)} alt={selected.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {!editing ? (
                    <>
                      <DetailRow label="Category" value={<span className="capitalize">{selected.category}</span>} />
                      <DetailRow label="Availability" value={<AvailBadge availability={selected.availability} />} />
                      <DetailRow label="Price" value={`$${selected.price.toFixed(2)}${selected.compareAtPrice ? ` (was $${selected.compareAtPrice.toFixed(2)})` : ''}`} />
                      <DetailRow label="Stock" value={String(selected.stock)} />
                      <DetailRow label="Badge" value={selected.badge ?? '—'} />
                      <DetailRow label="Featured" value={selected.isFeatured ? 'Yes' : 'No'} />
                      <DetailRow label="Active" value={selected.isActive ? 'Yes' : 'No'} />

                      <PanelDivider />

                      <DetailRow
                        label={`Sizes (${selected.availableSizes?.length ?? 0})`}
                        value={selected.availableSizes?.length ? selected.availableSizes.join(', ') : '—'}
                      />

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Colors ({selected.availableColors?.length ?? 0})</span>
                        {selected.availableColors?.length ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selected.availableColors.map((c) => (
                              <div key={c.name} className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hexCode }} />
                                <span className="text-xs text-white">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-sm text-white">—</span>}
                      </div>

                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <PrimaryButton onClick={() => { setEditing(true); setPanelError(''); }}>Edit</PrimaryButton>
                      </PanelActions>
                    </>
                  ) : (
                    <>
                      <div>
                        <FieldLabel>Availability</FieldLabel>
                        <FieldSelect value={editAvailability} onChange={(v) => setEditAvailability(v as AdminProduct['availability'])} options={AVAILABILITY_OPTIONS} />
                      </div>
                      <div>
                        <FieldLabel>Stock</FieldLabel>
                        <FieldInput value={editStock} onChange={setEditStock} placeholder="0" />
                      </div>
                      <div>
                        <FieldLabel>Price ($)</FieldLabel>
                        <FieldInput value={editPrice} onChange={setEditPrice} placeholder="0.00" />
                      </div>
                      <div>
                        <FieldLabel>Compare-at Price ($)</FieldLabel>
                        <FieldInput value={editComparePrice} onChange={setEditComparePrice} placeholder="Leave empty to remove" />
                      </div>
                      <div>
                        <FieldLabel>Badge</FieldLabel>
                        <FieldSelect value={editBadge} onChange={setEditBadge} options={BADGE_OPTIONS} />
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)} className="accent-primary" />
                          <span className="text-xs text-gray-300">Featured</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="accent-primary" />
                          <span className="text-xs text-gray-300">Active</span>
                        </label>
                      </div>

                      <PanelDivider />

                      {/* Sizes editor */}
                      <div>
                        <FieldLabel>Sizes</FieldLabel>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editSizes.map((s) => (
                            <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-white/10 text-white text-xs rounded-full">
                              {s}
                              <button onClick={() => setEditSizes(editSizes.filter(x => x !== s))} className="text-gray-400 hover:text-white">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={newSize} onChange={(e) => setNewSize(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(); } }}
                            placeholder="e.g. S, M, L, XL"
                            className="flex-1 bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/60"
                          />
                          <button onClick={addSize} className="px-2 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Colors editor */}
                      <div>
                        <FieldLabel>Colors</FieldLabel>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editColors.map((c) => (
                            <span key={c.name} className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 text-white text-xs rounded-full">
                              <div className="w-3 h-3 rounded-full border border-white/20 flex-none" style={{ backgroundColor: c.hexCode }} />
                              {c.name}
                              <button onClick={() => setEditColors(editColors.filter(x => x.name !== c.name))} className="text-gray-400 hover:text-white">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            value={newColorName} onChange={(e) => setNewColorName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                            placeholder="Color name"
                            className="flex-1 bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/60"
                          />
                          <div className="relative">
                            <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-primary/20 cursor-pointer bg-transparent p-0.5" />
                          </div>
                          <button onClick={addColor} className="px-2 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {panelError && <p className="text-red-400 text-xs">{panelError}</p>}
                      <PanelActions>
                        <button onClick={() => { setEditing(false); openPanel(selected); }} className="flex-1 px-3 py-2 border border-white/20 text-white rounded-full text-xs hover:bg-white/10 transition-colors">Cancel</button>
                        <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
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
