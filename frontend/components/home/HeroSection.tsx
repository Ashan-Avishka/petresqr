'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { QrCode, MapPin, ShieldCheck, ScanLine, ShoppingBag } from 'lucide-react';
import { foundAPI } from '../../api/found-api';
import QRScanner from '../Models/QRScanner';
import PetProfileModal from '../Models/PetProfile';

const HeroSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [petProfile, setPetProfile] = useState<{
    name: string;
    breed: string;
    age: string;
    photoUrl: string;
    medical: {
      conditions: string;
      allergies: string;
    };
    tag: {
      qrCode: string;
      status: string;
    };
    owner: {
      name: string;
      email: string;
      phone: string;
    };
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQRIconClick = () => {
    setShowScanner(true);
  };

  const handleScan = async (tagId: string) => {
    setLoading(true);
    try {
      const response = await foundAPI.getPetByTag(tagId);

      if (response.success && response.data) {
        // Transform the API response to match the modal's expected structure
        const transformedData = {
          name: response.data.pet.name,
          breed: response.data.pet.breed,
          age: response.data.pet.age.toString(),
          photoUrl: response.data.pet.photoUrl,
          medical: {
            conditions: response.data.pet.medical.conditions,
            allergies: response.data.pet.medical.allergies
          },
          tag: {
            qrCode: response.data.tag.qrCode,
            status: response.data.tag.status
          },
          owner: {
            name: response.data.owner.name,
            email: response.data.owner.email,
            phone: response.data.owner.phone
          }
        };
        setPetProfile(transformedData);
      } else {
        alert(response.error?.message || 'Tag not found or not assigned to any pet');
      }
    } catch (error) {
      console.error('Error finding pet:', error);
      alert('Failed to process QR code. Please try again.');
    } finally {
      setLoading(false);
      setShowScanner(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const handleFoundPet = () => {
    if (manualCode.trim()) {
      handleManualSubmit();
    } else {
      setShowScanner(true);
    }
  };

  const handleActivateTag = () => {
    console.log('Activate tag clicked');
    // Add your navigation or modal logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-primary/30 to-primary relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full"
        >
        </motion.div>
      </div>

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      <PetProfileModal
        isOpen={petProfile !== null}
        onClose={() => setPetProfile(null)}
        pet={petProfile}
      />

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 md:pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8 lg:pt-12 pt-10"
          >
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[45px] sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight "
            >
              Keep Your Furry Friends Safe
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed"
            >
              Advanced QR code technology that connects lost pets with their families instantly. One scan. Instant connection. Peace of mind.
            </motion.p>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl max-w-2xl border border-amber-200/50"
            >
              <div className="flex items-center gap-3 flex-1 px-3 sm:px-4 min-w-0">
                <button
                  onClick={handleQRIconClick}
                  className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                  disabled={loading}
                >
                  <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 hover:text-amber-600" />
                </button>
                {mounted ? (
                  <input
                    type="text"
                    placeholder="Scan QR or Enter code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-700 placeholder-gray-500 min-w-0"
                  />
                ) : (
                  <div className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border border-slate-200 h-12" />
                )}

              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-2 bg-gradient-to-tl from-primary to-black text-white text-sm sm:text-base rounded-full shadow-md shadow-black transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                onClick={handleFoundPet}
                disabled={loading}
              >
                {manualCode.trim() ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Find Now</span>
                    <span className="sm:hidden">Find</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-4 h-4" />
                    <span className="hidden sm:inline">Scan Now</span>
                    <span className="sm:hidden">Scan</span>
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 sm:gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-br from-primary to-black shadow-primary text-white text-base sm:text-lg rounded-full shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={handleActivateTag}
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </motion.button>

              {/* Reviews */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-400 font-medium">Trusted by 50k+ users</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current mr-0.5 sm:mr-1"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-400">
                    <span className="font-bold">4.1</span>/5{' '}
                    <span className="text-gray-400">(14k Reviews)</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image Container with Animated Border */}
          <div className="relative h-[250px] sm:h-[400px] md:h-[450px] lg:h-[500px] lg:mt-40">
            {/* Bordered Container (Background) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative w-full h-full rounded-lg"
            >
              {/* Animated SVG overlay for drawing effect */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 2 }}
              >
                <motion.rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="8"
                  fill="white"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{
                    duration: 0.1,
                    delay: 0.2,
                  }}
                />
                <motion.rect
                  x="2"
                  y="2"
                  width="calc(100% - 4px)"
                  height="calc(100% - 4px)"
                  rx="6"
                  fill="none"
                  stroke="url(#borderGradient)"
                  strokeWidth="4"
                  strokeDasharray="1800"
                  initial={{ strokeDashoffset: 1900 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: 2.5,
                    delay: 0.3,
                    ease: "easeInOut"
                  }}
                />
                <defs>
                  <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FABC3F" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Image in front of the border */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-0 left-0 w-full"
              style={{ zIndex: 10 }}
            >
              <div className="relative w-full h-[300px] sm:h-[500px] md:h-[550px] lg:h-[700px] ml-6 sm:-ml-3 md:-ml-4 mb-4">
                <Image
                  src="/images/hero-img.png"
                  alt="Adorable pug looking up"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;