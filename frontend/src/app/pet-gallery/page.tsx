// app/pets/page.tsx - Gallery Page
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Calendar, Share2, Search, ChevronLeft, ChevronRight, Dog, Cat } from 'lucide-react';
import HeroHeader from '../../../components/ui/PageHero';
import { petAPI } from '../../../api/pet-api';
import type { Pet } from '../../../api/pet-types';

type FilterType = 'all' | 'dogs' | 'cats' | 'reunited' | 'adopted' | 'lost' | 'found';

const PetGalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 6;

  // Load pets data on mount
  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await petAPI.getGalleryPets();
        
        if (response.success && response.data) {
          const petsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
          setPets(petsData);
        } else {
          setError(response.error?.message || 'Failed to load pets');
        }
      } catch (err: any) {
        console.error('Error loading pets:', err);
        setError('Failed to load pets');
      } finally {
        setLoading(false);
      }
    };
    loadPets();
  }, []);

  const filters = [
    { id: 'all' as FilterType, label: 'All' },
    { id: 'dogs' as FilterType, label: 'Dogs' },
    { id: 'cats' as FilterType, label: 'Cats' },
    { id: 'reunited' as FilterType, label: 'Reunited' },
    { id: 'adopted' as FilterType, label: 'Adopted' },
    { id: 'lost' as FilterType, label: 'Lost' },
    { id: 'found' as FilterType, label: 'Found' }
  ];

  const filteredPets = useMemo(() => {
    let filtered = pets;

    // Filter by pet type
    if (activeFilter === 'dogs') {
      filtered = filtered.filter(pet => pet.type === 'dog');
    } else if (activeFilter === 'cats') {
      filtered = filtered.filter(pet => pet.type === 'cat');
    } 
    // Filter by story status
    else if (['reunited', 'adopted', 'lost', 'found'].includes(activeFilter)) {
      filtered = filtered.filter(pet => pet.story?.status === activeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.story?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.bio?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeFilter, searchQuery, pets]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPets = filteredPets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const getStatusBadge = (status?: string) => {
    const badges = {
      reunited: { label: 'Reunited!', color: 'bg-green-500' },
      adopted: { label: 'Adopted', color: 'bg-purple-500' },
      lost: { label: 'Lost', color: 'bg-red-500' },
      found: { label: 'Found', color: 'bg-yellow-500' },
      protected: { label: 'Protected', color: 'bg-blue-500' }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading pets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black">
      {/* Header */}
      <HeroHeader
        backgroundImage="./images/page-hero6.png"
        title="Pet Gallery"
        subtitle="Discover amazing pets and their inspiring stories. Every pet here is protected and loved."
      >
        {/* Combined Filters and Search - Responsive */}
        <div className="md:max-w-4xl max-w-[350px] -mt-10 mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-full shadow-lg p-2 flex md:flex-row flex-col md:items-center gap-2">
          {/* Filters */}
          <div className="pl-15 md:pl-2 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 md:px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 transition-all ${activeFilter === filter.id
                  ? 'bg-gradient-to-br from-primary via-black via-70% to-black text-white shadow-md shadow-primary'
                  : 'text-gray-300 hover:shadow-sm hover:shadow-primary hover:bg-white/10'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden md:block h-8 w-px bg-gray-400"></div>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pets..."
              className="w-full pl-4 pr-10 py-2 bg-transparent text-gray-300 placeholder-gray-400 focus:outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </HeroHeader>

      {/* Pet Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-20 py-10 md:pb-40 pb-20">
        {/* Results count */}
        <div className="mb-6 text-gray-300 text-center">
          Showing {filteredPets.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredPets.length)} of {filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'}
        </div>

        {currentPets.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {currentPets.map((pet, index) => {
                const badge = getStatusBadge(pet.story?.status);
                const protectedDays = calculateProtectedDays(pet.createdAt);
                
                return (
                  <div
                    key={pet.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.5s ease ${index * 0.1}s forwards`
                    }}
                  >
                    <Link href={`/pet-gallery/${pet.id}`}>
                      <div className="bg-gray-400/40 backdrop-blur-3xl rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                        <div className="relative h-48 md:h-64">
                          <img
                            src={pet.image || '/api/placeholder/400/300'}
                            alt={`${pet.name} - ${pet.breed}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${badge.color}`}>
                            {badge.label}
                          </div>
                          <div className="absolute top-4 right-4">
                            {pet.type === 'dog' ? (
                              <Dog className="w-6 h-6 text-white drop-shadow-lg" />
                            ) : (
                              <Cat className="w-6 h-6 text-white drop-shadow-lg" />
                            )}
                          </div>
                        </div>

                        <div className="p-4 md:p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl md:text-2xl font-bold text-primary mb-1">{pet.name}</h3>
                              <p className="text-gray-300 text-sm md:text-base">{pet.breed}</p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                // Add favorite logic here
                              }}
                              className="hidden md:block p-2 hover:bg-gray-300 rounded-full transition-colors"
                            >
                              <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-red-500 transition-colors" />
                            </button>
                          </div>

                          {/* Desktop only: Additional details */}
                          <div className="hidden md:block">
                            {pet.story?.location && (
                              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 mb-2 md:mb-3">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{pet.story.location}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 mb-3 md:mb-4">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                              <span>Protected for {protectedDays} {protectedDays === 1 ? 'day' : 'days'}</span>
                            </div>

                            {pet.story?.content && (
                              <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                                {pet.story.content}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
                              <span className="text-gray-400 font-medium text-xs md:text-sm group-hover:text-primary">
                                Read Story →
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Add share logic here
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <Share2 className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-full font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary text-white shadow-md shadow-primary'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-gray-500 px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No pets found matching your criteria.</p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PetGalleryPage;