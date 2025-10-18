'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../ui/Button';

const galleryImagesSets = [
  // First Set - 6 images
  [
    {
      id: 1,
      src: '/images/gallery-1.jpg',
      alt: 'Golden Retriever',
      className: 'col-span-2 row-span-2',
    },
    {
      id: 2,
      src: '/images/gallery-2.jpg',
      alt: 'Black Pug',
      className: 'col-span-2 row-span-3',
    },
    {
      id: 3,
      src: '/images/gallery-3.jpg',
      alt: 'White Kitten',
      className: 'col-span-2 row-span-3',
    },
    {
      id: 4,
      src: '/images/gallery-4.jpg',
      alt: 'Border Collie',
      className: 'col-span-4 row-span-5',
    },
    {
      id: 5,
      src: '/images/gallery-5.jpg',
      alt: 'Happy Dog',
      className: 'col-span-2 row-span-3',
    },
    {
      id: 6,
      src: '/images/gallery-6.jpg',
      alt: 'Cozy Puppy',
      className: 'col-span-4 row-span-2',
    },
  ],
  // Second Set - 6 images with DIFFERENT layout
  [
    {
      id: 1,
      src: '/images/gallery-1.jpg',
      alt: 'Golden Retriever',
      className: 'col-span-3 row-span-2',
    },
    {
      id: 2,
      src: '/images/gallery-2.jpg',
      alt: 'Black Pug',
      className: 'col-span-3 row-span-3',
    },
    {
      id: 3,
      src: '/images/gallery-3.jpg',
      alt: 'White Kitten',
      className: 'col-span-4 row-span-2',
    },
    {
      id: 4,
      src: '/images/gallery-4.jpg',
      alt: 'Border Collie',
      className: 'col-span-3 row-span-3',
    },
    {
      id: 5,
      src: '/images/gallery-5.jpg',
      alt: 'Happy Dog',
      className: 'col-span-4 row-span-3',
    },
    {
      id: 6,
      src: '/images/gallery-6.jpg',
      alt: 'Cozy Puppy',
      className: 'col-span-3 row-span-2',
    },
  ],
  // Third Set - 6 images with ANOTHER layout
  [
    {
      id: 1,
      src: '/images/gallery-1.jpg',
      alt: 'Golden Retriever',
      className: 'col-span-4 row-span-3',
    },
    {
      id: 2,
      src: '/images/gallery-2.jpg',
      alt: 'Black Pug',
      className: 'col-span-3 row-span-2',
    },
    {
      id: 3,
      src: '/images/gallery-3.jpg',
      alt: 'White Kitten',
      className: 'col-span-3 row-span-2',
    },
    {
      id: 4,
      src: '/images/gallery-4.jpg',
      alt: 'Border Collie',
      className: 'col-span-4 row-span-3',
    },
    {
      id: 5,
      src: '/images/gallery-5.jpg',
      alt: 'Happy Dog',
      className: 'col-span-2 row-span-3',
    },
    {
      id: 6,
      src: '/images/gallery-6.jpg',
      alt: 'Cozy Puppy',
      className: 'col-span-4 row-span-2',
    },
  ],
];

export default function PetGallery() {
  const [hoveredId, setHoveredId] = useState(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Memoize current images to prevent unnecessary recalculations
  const currentImages = useMemo(() => galleryImagesSets[currentSetIndex], [currentSetIndex]);

  // Auto-rotate through image sets with optimized progress tracking
  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    const rotateInterval = setInterval(() => {
      setCurrentSetIndex((prev) => (prev + 1) % galleryImagesSets.length);
      setProgress(0);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(rotateInterval);
    };
  }, [currentSetIndex]);

  // Memoize hover handlers
  const handleMouseEnter = useCallback((id) => setHoveredId(id), []);
  const handleMouseLeave = useCallback(() => setHoveredId(null), []);

  const handleSetClick = useCallback((index) => {
    setCurrentSetIndex(index);
    setProgress(0);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Pet Gallery
          </h2>
          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {galleryImagesSets.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSetClick(index)}
                className="relative h-1.5 w-12 bg-gray-300 rounded-full overflow-hidden"
                aria-label={`View gallery set ${index + 1}`}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100 ease-linear"
                  style={{
                    width: currentSetIndex === index ? `${progress}%` : '0%',
                  }}
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gallery Grid with Layout Morphing */}
        <div className="grid grid-cols-4 md:grid-cols-10 auto-rows-[100px] gap-3 md:gap-4">
          {currentImages.map((image) => (
            <motion.div
              key={image.id}
              layout
              layoutId={`image-${image.id}`}
              initial={false}
              transition={{
                layout: {
                  duration: 0.6,
                  ease: [0.43, 0.13, 0.23, 0.96],
                },
              }}
              className={`relative ${image.className} overflow-hidden rounded-xl md:rounded-2xl shadow-lg cursor-pointer group`}
              onMouseEnter={() => handleMouseEnter(image.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Image with optimized rendering */}
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-110"
              />

              {/* Overlay on hover - using CSS for better performance */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-4 transition-opacity duration-300 pointer-events-none ${hoveredId === image.id ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <span className="text-white font-semibold text-sm md:text-base px-4 text-center">
                  {image.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            variant="primary"
            size="md"
          >
            View More Pets
          </Button>
        </motion.div>
      </div>
    </section>
  );
}