// app/pet-gallery/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Share2, Loader2, ArrowLeft } from 'lucide-react';
import { petAPI } from '../../../../api/pet-api';
import type { Pet } from '../../../../api/pet-types';

const PetDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('story');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadPet = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the public gallery endpoint instead
        const response = await petAPI.getGalleryPet(petId);

        if (response.success && response.data) {
          setPet(response.data);
        } else {
          setError(response.error?.message || 'Failed to load pet details');
        }
      } catch (err: any) {
        console.error('Error loading pet:', err);
        setError('Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      loadPet();
    }
  }, [petId]);

  const tabs = [
    { id: 'story', label: 'Story' },
    { id: 'details', label: 'Details' },
    { id: 'about', label: 'About' }
  ];

  const getStatusBadge = (status?: string) => {
    const badges = {
      reunited: { label: 'Reunited!', color: 'bg-green-500', icon: '🎉' },
      adopted: { label: 'Adopted', color: 'bg-purple-500', icon: '💜' },
      lost: { label: 'Lost', color: 'bg-red-500', icon: '🔍' },
      found: { label: 'Found', color: 'bg-yellow-500', icon: '✨' },
      protected: { label: 'Protected', color: 'bg-blue-500', icon: '🛡️' }
    };
    return badges[status as keyof typeof badges] || badges.protected;
  };

  const calculateProtectedDays = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleShare = async () => {
    const shareData = {
      title: `${pet?.name} - ${pet?.breed}`,
      text: `Check out ${pet?.name}'s story!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-400 text-xl mb-6">{error || 'Pet not found'}</p>
          <button
            onClick={() => router.push('/pets')}
            className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(pet.story?.status);
  const protectedDays = calculateProtectedDays(pet.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden">
          <div className="relative md:h-[600px] h-80">
            <div className="relative w-full h-full rounded-b-[2rem] overflow-hidden shadow-lg mt-6 md:mt-25">
              <Image
                src={pet.image || '/api/placeholder/800/600'}
                alt={`${pet.name} - ${pet.breed}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
            </div>

            <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-full text-white shadow-md flex items-center gap-2 ${badge.color}`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>

            {!isMobile && (
              <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-gradient-to-br from-primary via-black via-80% to-black shadow-sm shadow-primary hover:shadow-md transition-shadow">
                <Link href="/pet-gallery" className="text-white font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Stories
                </Link>
              </div>
            )}
          </div>

          <div className="py-8 md:py-12 mb-20 md:min-h-[700px] min-h-[100px]">
            {/* Pet Name & Basic Info */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{pet.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <span className="text-xl">{pet.breed}</span>
                {pet.age && (
                  <>
                    <span>|</span>
                    <span>{pet.age} Years old</span>
                  </>
                )}
                {pet.gender && (
                  <>
                    <span>|</span>
                    <span className="capitalize">{pet.gender}</span>
                  </>
                )}
                {pet.story?.location && (
                  <>
                    <span>|</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{pet.story.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
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
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-white" />
                        <span className="text-white">
                          Protected for {protectedDays} {protectedDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      {pet.story?.date && (
                        <p className="text-primary">
                          {pet.story.status === 'reunited' ? 'Reunited on: ' : 'Story from: '}
                          {new Date(pet.story.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>

                    {pet.story?.content && (
                      <div>
                        <h2 className="text-2xl font-bold text-primary mb-4">{pet.name}'s Story</h2>
                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                          {pet.story.content}
                        </p>
                      </div>
                    )}

                    {pet.story?.status === 'reunited' && (
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

                    {pet.story?.status === 'adopted' && (
                      <div className="bg-gradient-to-br from-primary via-black via-30% to-black border-l-4 border-primary p-6 rounded-xl shadow-sm shadow-primary">
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          💜 New Beginning!
                        </h3>
                        <p className="text-gray-300">
                          {pet.name} has found a loving forever home! The PetRescue tag will continue
                          to keep them safe in their new family.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-primary via-black via-10% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Breed</label>
                        <p className="text-gray-300 font-semibold">{pet.breed}</p>
                      </div>
                      {pet.age && (
                        <div className="bg-gradient-to-br from-primary via-black via-10% to-black p-4 rounded-xl shadow-sm shadow-primary">
                          <label className="text-sm font-medium text-gray-300 block mb-1">Age</label>
                          <p className="text-gray-300 font-semibold">{pet.age} Years old</p>
                        </div>
                      )}

                    </div>
                    <div className='space-y-4'>
                      {pet.weight && (
                        <div className="bg-gradient-to-br from-primary via-black via-10% to-black p-4 rounded-xl shadow-sm shadow-primary">
                          <label className="text-sm font-medium text-gray-300 block mb-1">Weight</label>
                          <p className="text-gray-300 font-semibold">{pet.weight} KG</p>
                        </div>
                      )}
                      {pet.gender && (
                        <div className="bg-gradient-to-br from-primary via-black via-10% to-black p-4 rounded-xl shadow-sm shadow-primary">
                          <label className="text-sm font-medium text-gray-300 block mb-1">Gender</label>
                          <p className="text-gray-300 font-semibold capitalize">{pet.gender}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">

                      {pet.color && (
                        <div className="bg-gradient-to-br from-primary via-black via-10% to-black p-4 rounded-xl shadow-sm shadow-primary">
                          <label className="text-sm font-medium text-gray-300 block mb-1">Color</label>
                          <p className="text-gray-300 font-semibold">{pet.color}</p>
                        </div>
                      )}
                      <div className="bg-gradient-to-br from-primary via-black via-10% to-black p-4 rounded-xl shadow-sm shadow-primary">
                        <label className="text-sm font-medium text-gray-300 block mb-1">Type</label>
                        <p className="text-gray-300 font-semibold capitalize">{pet.type}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {pet.bio?.description && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-300 mb-3">Description</h3>
                        <p className="text-gray-400 leading-relaxed">{pet.bio.description}</p>
                      </div>
                    )}
                    {pet.bio?.personality && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-300 mb-3">Personality</h3>
                        <p className="text-gray-400 leading-relaxed">{pet.bio.personality}</p>
                      </div>
                    )}
                    {pet.bio?.medicalNotes && (
                      <div className="bg-white/20 backdrop-blur-sm border border-gray-500/50 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-gray-300 mb-3">Medical Notes</h3>
                        <p className="text-gray-400">{pet.bio.medicalNotes}</p>
                      </div>
                    )}
                    {!pet.bio?.description && !pet.bio?.personality && !pet.bio?.medicalNotes && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No additional information available.</p>
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
                <button
                  onClick={handleShare}
                  className="px-6 py-2 mr-2 bg-gradient-to-br from-primary via-black via-80% to-black text-white rounded-full shadow-sm shadow-primary hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Mobile Back Button */}
            {isMobile && (
              <div className="mt-8">
                <Link
                  href="/pets"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-br from-primary via-black via-80% to-black text-white rounded-full shadow-sm shadow-primary"
                >
                  ← Back to Stories
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailPage;