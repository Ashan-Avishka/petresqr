'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
  const handleFoundPet = () => {
    console.log('Found a pet clicked');
    // Add your navigation or modal logic here
  };

  const handleActivateTag = () => {
    console.log('Activate tag clicked');
    // Add your navigation or modal logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary to-slate-50 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full"
        >
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl" />
        </motion.div>
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
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-orange-200/20 to-amber-200/20 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 lg:pt-12"
          >
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
            >
              Keep Your Furry Friends Safe
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-gray-700 max-w-xl leading-relaxed"
            >
              Advanced QR code technology that connects lost pets with their families instantly. One scan. Instant connection. Peace of mind.
            </motion.p>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl max-w-2xl border border-amber-200/50"
            >
              <div className="flex items-center gap-3 flex-1 px-4">
                <svg
                  className="w-6 h-6 text-amber-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <path d="M7 7h4v4H7z" strokeWidth="2" />
                  <path d="M7 13h.01M13 7h.01M13 13h.01M7 17h.01M13 17h.01M17 7h.01M17 13h.01M17 17h.01" strokeWidth="2" />
                </svg>
                <input
                  type="text"
                  placeholder="Scan the QR or Enter the code"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleFoundPet}
              >
                FOUND A PET
              </Button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row items-start gap-6"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleActivateTag}
                className=""
              >
                ACTIVATE A TAG
              </Button>

              {/* Reviews */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Trusted by 50k+ users</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 text-amber-800 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">
                    <span className="font-bold">4.1</span>/5{' '}
                    <span className="text-gray-500">(14k Reviews)</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image Container with Animated Border */}
          <div className="relative lg:h-[500px] mt-40">
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
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#f59e0b" />
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
              <div className="relative w-full h-[500px] lg:h-[700px] mb-4 -ml-4">
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