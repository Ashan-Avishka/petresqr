// components/PetDetail.tsx - Client Component for Pet Details
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pet } from '../../types/pet';
import { MapPin, Calendar, Share2 } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const PetDetail: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [activeTab, setActiveTab] = useState('story');

  const tabs = [
    { id: 'story', label: 'Story' },
    { id: 'details', label: 'Details' },
    { id: 'about', label: 'About' }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      reunited: { label: 'Reunited!', color: 'bg-green-500', icon: '🎉' },
      featured: { label: 'Featured Story', color: 'bg-amber-500', icon: '⭐' },
      protected: { label: 'Protected', color: 'bg-blue-500', icon: '🛡️' }
    };
    return badges[status as keyof typeof badges] || badges.protected;
  };

  const badge = getStatusBadge(pet.status);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-primary via-black to-black ">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:min-h-380 min-h-100">
        <div className="overflow-hidden">
          <div className="relative md:h-150 h-80">
            <div className="relative w-full h-full rounded-b-4xl overflow-hidden shadow-lg mt-25">
              <Image
                src={pet.image}
                alt={`${pet.name} - ${pet.breed}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
            </div>

            <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-full text-white shadow-md shadow-primary flex items-center gap-2`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
            {useIsMobile() ? null : (
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-gradient-to-br from-primary via-black via-80% to-black shadow-md shadow-primary">
              <Link href="/pets" className="text-white hover:text-primary font-medium ">
                ← Back to Stories
              </Link>
            </div>
            )}
          </div>

          <div className="py-15 mb-20">
            {/* Pet Name & Basic Info */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{pet.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <span className="text-xl">{pet.breed}</span>
                <span>|</span>
                <span>{pet.age} years old</span>
                <span>|</span>
                <span className="capitalize">{pet.gender}</span>
                <span>|</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{pet.location}</span>
                </div>
              </div>
            </div>

            {/* Tags Navigation */}
            <div className="flex gap-2 border-b border-gray-300 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors relative ${activeTab === tab.id
                    ? 'text-primary'
                    : 'text-gray-300 hover:text-primary'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'story' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary via-black via-30% to-black border-l-4 border-primary p-6 rounded-xl shadow-sm shadow-primary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-white" />
                        <span className="text-white">
                          Protected for {pet.protectedDays} days
                        </span>
                      </div>
                      {pet.foundDate && (
                        <p className="text-primary">
                          Reunited on: {new Date(pet.foundDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-primary mb-4">{pet.name}'s Story</h2>
                      <p className="text-gray-300 text-lg leading-relaxed">{pet.story}</p>
                    </div>

                    {pet.status === 'reunited' && (
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black border-l-4 border-primary p-6 rounded-xl shadow-sm shadow-primary">
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          🎉 Happy Ending!
                        </h3>
                        <p className="text-gray-300">
                          Thanks to the PetRescue tag, {pet.name} was safely reunited with their family.
                          The QR code made it easy for the finder to contact the owners immediately.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Breed</label>
                        <p className="text-gray-300 font-semibold">{pet.breed}</p>
                      </div>
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Age</label>
                        <p className="text-gray-300 font-semibold">{pet.age} years</p>
                      </div>
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Weight</label>
                        <p className="text-gray-300 font-semibold">{pet.weight} kg</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Gender</label>
                        <p className="text-gray-300 font-semibold capitalize">{pet.gender}</p>
                      </div>
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Color</label>
                        <p className="text-gray-300 font-semibold">{pet.color}</p>
                      </div>
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Tag ID</label>
                        <p className="text-gray-300 font-mono font-semibold">{pet.tagId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-300 mb-3">Description</h3>
                      <p className="text-gray-400 leading-relaxed">{pet.bio.description}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-300 mb-3">Personality</h3>
                      <p className="text-gray-400 leading-relaxed">{pet.bio.personality}</p>
                    </div>
                    {pet.bio.medicalNotes && (
                      <div className="bg-white/20 backdrop-blur-sm border border-gray-500/50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-gray-300 mb-3">Medical Notes</h3>
                        <p className="text-gray-400">{pet.bio.medicalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-1">Share {pet.name}'s Story</h3>
                  <p className="text-gray-300 text-sm">Help spread awareness about pet safety</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-br from-primary via-black via-80% to-black text-white rounded-full shadow-md shadow-primary transition-all flex items-center gap-2"
                // onClick={handleFoundPet}
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;