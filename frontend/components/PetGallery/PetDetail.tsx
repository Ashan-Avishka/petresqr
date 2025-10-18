// components/PetDetail.tsx - Client Component for Pet Details
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pet } from '../../types/pet';
import { MapPin, Calendar, Share2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white overflow-hidden pt-20">
          <div className="relative h-96">
            <Image
              src={pet.image}
              alt={`${pet.name} - ${pet.breed}`}
              fill
              className="object-cover"
              priority
            />
            <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-white font-medium ${badge.color} flex items-center gap-2`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
            <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-yellow-50">
              <Link href="/pets" className="text-amber-600 hover:text-amber-700 font-medium">
                ← Back to Stories
              </Link>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Pet Name & Basic Info */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{pet.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="text-xl">{pet.breed}</span>
                <span>•</span>
                <span>{pet.age} years old</span>
                <span>•</span>
                <span className="capitalize">{pet.gender}</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{pet.location}</span>
                </div>
              </div>
            </div>

            {/* Tags Navigation */}
            <div className="flex gap-2 border-b border-gray-200 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-amber-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
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
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-amber-900">
                          Protected for {pet.protectedDays} days
                        </span>
                      </div>
                      {pet.foundDate && (
                        <p className="text-amber-800">
                          Reunited on: {new Date(pet.foundDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{pet.name}'s Story</h2>
                      <p className="text-gray-700 text-lg leading-relaxed">{pet.story}</p>
                    </div>

                    {pet.status === 'reunited' && (
                      <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <h3 className="text-xl font-semibold text-green-900 mb-2">
                          🎉 Happy Ending!
                        </h3>
                        <p className="text-green-800">
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
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Breed</label>
                        <p className="text-gray-900 font-semibold">{pet.breed}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Age</label>
                        <p className="text-gray-900 font-semibold">{pet.age} years</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Weight</label>
                        <p className="text-gray-900 font-semibold">{pet.weight} kg</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Gender</label>
                        <p className="text-gray-900 font-semibold capitalize">{pet.gender}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Color</label>
                        <p className="text-gray-900 font-semibold">{pet.color}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-1">Tag ID</label>
                        <p className="text-gray-900 font-mono font-semibold">{pet.tagId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{pet.bio.description}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Personality</h3>
                      <p className="text-gray-700 leading-relaxed">{pet.bio.personality}</p>
                    </div>
                    {pet.bio.medicalNotes && (
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-900 mb-3">Medical Notes</h3>
                        <p className="text-blue-800">{pet.bio.medicalNotes}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Share {pet.name}'s Story</h3>
                  <p className="text-gray-600 text-sm">Help spread awareness about pet safety</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;