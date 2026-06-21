'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Dog, MapPin, Activity } from 'lucide-react';
import { getScanAnalytics } from '../../../api/admin-api';
import type { ScanAnalytics } from '../../../api/admin-types';

const DAY_OPTIONS = [7, 30, 90] as const;
type Days = (typeof DAY_OPTIONS)[number];

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [days, setDays] = useState<Days>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getScanAnalytics(days).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Scan Analytics</h3>
          <p className="text-gray-400 text-sm mt-1">QR code scan activity</p>
        </div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm transition-all border-b border-primary ${
                days === d
                  ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : !analytics ? (
        <p className="text-red-400 text-center py-10">Failed to load analytics.</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: QrCode, label: 'Total Scans', value: analytics.totalScans, color: 'bg-cyan-500/20' },
              { icon: Dog, label: 'Unique Pets Scanned', value: analytics.uniquePets, color: 'bg-green-500/20' },
              {
                icon: MapPin,
                label: 'Top Location',
                value: analytics.scansByLocation[0]?._id ?? 'N/A',
                color: 'bg-purple-500/20',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{card.label}</p>
                    <p className="text-white text-2xl font-bold">{card.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Top scanned pets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6"
          >
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Top Scanned Pets
            </h4>

            {analytics.topScannedPets.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No scan data for this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium px-2 py-3">#</th>
                    <th className="text-left text-gray-400 font-medium px-2 py-3">Pet Name</th>
                    <th className="text-left text-gray-400 font-medium px-2 py-3">Owner</th>
                    <th className="text-left text-gray-400 font-medium px-2 py-3">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topScannedPets.map((entry, idx) => {
                    const pet = entry.pet[0];
                    return (
                      <tr key={entry._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-2 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-2 py-3 text-white font-medium">{pet?.name ?? '—'}</td>
                        <td className="px-2 py-3 text-gray-300">
                          {pet?.ownerId
                            ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}`
                            : '—'}
                        </td>
                        <td className="px-2 py-3">
                          <span className="text-primary font-bold">{entry.count}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
