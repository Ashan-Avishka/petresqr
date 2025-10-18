'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onAddToCart?: (id: string) => void;
  className?: string;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  onAddToCart,
  className = '',
  index = 0,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id);
    }
    console.log(`Added ${name} to cart`);
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  if (!isMounted) {
    return (
      <div className={`bg-amber-100/50 rounded-2xl p-4 shadow-md ${className}`}>
        <div className="relative w-full aspect-square bg-gradient-to-br from-amber-50 to-stone-200 rounded-xl mb-4">
          <div className="animate-pulse w-full h-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`bg-white/50 rounded-2xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {/* Image Container */}
      <div
        className="relative w-full aspect-square bg-gradient-to-br from-white to-stone-100 shadow-sm rounded-xl mb-4 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image with Zoom Effect */}
        <motion.div
          animate={{
            scale: isHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full h-full"
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4"
            priority
          />
        </motion.div>

        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200 hover:scale-110 active:scale-90"
          aria-label={isLiked ? "Unlike" : "Like"}
          suppressHydrationWarning
        >
          <motion.svg
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-600'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
            initial={false}
            animate={{
              scale: isLiked ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
            />
          </motion.svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {name}
          </h3>
          <p className="text-xl font-bold text-amber-600">
            ${price}
          </p>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-90 group"
          aria-label="Add to cart"
          suppressHydrationWarning
        >
          <motion.svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            whileHover={{
              y: [-1, 0, -1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </motion.svg>
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;