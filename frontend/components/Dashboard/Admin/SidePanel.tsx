'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// Inline side panel on desktop, fixed overlay drawer on mobile.
// Desktop parent must be: flex overflow-hidden with a fixed height.
export default function SidePanel({ open, onClose, title, subtitle, children }: SidePanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // ── Mobile: fixed right-drawer overlay ────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 z-40"
              onClick={onClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed top-0 right-0 h-full w-full z-50 bg-[#111] border-l border-primary/30 flex flex-col"
            >
              <div className="flex items-start justify-between px-5 py-4 border-b border-white/10 flex-none">
                <div className="min-w-0 pr-3">
                  <h4 className="text-white font-semibold text-base truncate">{title}</h4>
                  {subtitle && <p className="text-gray-400 text-xs mt-0.5 truncate">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors flex-none mt-0.5 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Desktop: inline flex sibling ──────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="side-panel"
          initial={{ width: 0 }}
          animate={{ width: 440 }}
          exit={{ width: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          className="flex-none border-l border-primary/30 overflow-hidden flex flex-col h-full"
        >
          <div className="w-[440px] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-white/10 flex-none">
              <div className="min-w-0 pr-3">
                <h4 className="text-white font-semibold text-base truncate">{title}</h4>
                {subtitle && <p className="text-gray-400 text-xs mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors flex-none mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Tab bar (place inside SidePanel children) ─────────────────────────────────
export function SidePanelTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-0 border-b border-white/10 -mx-5 px-5 mb-1">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            active === t
              ? 'border-primary text-white'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────
export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-white break-words">{value ?? '—'}</span>
    </div>
  );
}

export function PanelDivider() {
  return <div className="border-t border-white/10" />;
}

export function PanelActions({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 pt-1">{children}</div>;
}

export function DangerButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/40 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-40">
      {children}
    </button>
  );
}

export function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 px-3 py-2 bg-gradient-to-br from-primary via-black to-black border border-primary/70 text-white rounded-full text-xs font-medium hover:shadow-primary/30 hover:shadow-md transition-all disabled:opacity-40">
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">{children}</label>;
}

export function FieldInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/60" />
  );
}

export function FieldSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/60">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
