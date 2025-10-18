// app/pets/page.tsx - Gallery Page
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Share2 } from 'lucide-react';
import { petsData } from '../../../lib/pets';
import HeroHeader from '../../../components/ui/PageHero';

type FilterType = 'all' | 'dogs' | 'cats' | 'reunited' | 'featured';

const PetGalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [pets] = useState(petsData);

  const filters = [
    { id: 'all' as FilterType, label: 'All Pets' },
    { id: 'dogs' as FilterType, label: 'Dogs' },
    { id: 'cats' as FilterType, label: 'Cats' },
    { id: 'reunited' as FilterType, label: 'Happy Reunions' },
    { id: 'featured' as FilterType, label: 'Featured Stories' }
  ];

  const filteredPets = pets.filter(pet => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'dogs') return pet.type === 'dog';
    if (activeFilter === 'cats') return pet.type === 'cat';
    if (activeFilter === 'reunited') return pet.status === 'reunited';
    if (activeFilter === 'featured') return pet.status === 'featured';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      reunited: { label: 'Reunited!', color: 'bg-green-500' },
      featured: { label: 'Featured', color: 'bg-amber-500' },
      protected: { label: 'Protected', color: 'bg-blue-500' }
    };
    return badges[status as keyof typeof badges] || badges.protected;
  };

  return (
    <div className="min-h-screen bg-primary-background">
      {/* Header */}
      <HeroHeader
        backgroundImage="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
        title="Lorem ipsum dolor"
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      >
        {/* Filters */}
        <div className="max-w-150 mx-auto bg-white rounded-full shadow-lg p-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${activeFilter === filter.id
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </HeroHeader>

      {/* Pet Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPets.map((pet, index) => {
            const badge = getStatusBadge(pet.status);
            return (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/pet-gallery/${pet.slug}`}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                    <div className="relative h-64">
                      <Image
                        src={pet.image}
                        alt={`${pet.name} - ${pet.breed}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium ${badge.color}`}>
                        {badge.label}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{pet.name}</h3>
                          <p className="text-gray-600">{pet.breed}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{pet.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Protected for {pet.protectedDays} days</span>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{pet.story}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-amber-600 font-medium text-sm group-hover:text-amber-700">
                          Read Story →
                        </span>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PetGalleryPage;