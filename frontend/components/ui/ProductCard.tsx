'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  rating?: number;
  reviews?: number;
  badge?: 'bestseller' | 'new' | 'sale' | 'featured';
  inStock?: boolean;
  onAddToCart?: (id: string) => void;
  className?: string;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  description,
  rating = 0,
  reviews = 0,
  badge,
  inStock = true,
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
    if (onAddToCart && inStock) {
      onAddToCart(id);
    }
    console.log(`Added ${name} to cart`);
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  const getBadgeColor = (badgeType?: string) => {
    switch (badgeType) {
      case 'bestseller':
        return 'bg-orange-500';
      case 'new':
        return 'bg-green-500';
      case 'sale':
        return 'bg-red-500';
      case 'featured':
        return 'bg-primary';
      default:
        return '';
    }
  };

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

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
      className={`bg-gray-400/40 backdrop-blur-3xl rounded-2xl md:p-4 p-2 shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {/* Image Container */}
      <div
        className="relative w-full aspect-square bg-gradient-to-tl from-black via-black to-primary/20 shadow-sm rounded-xl mb-4 overflow-hidden cursor-pointer"
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

        {/* Badge */}
        {badge && (
          <div className={`absolute top-3 left-3 px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${getBadgeColor(badge)}`}>
            {badge.toUpperCase()}
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 px-2 md:px-3 py-1 rounded-full bg-red-500 text-white text-xs md:text-sm font-medium" style={{ marginTop: badge ? '2.5rem' : '0' }}>
            -{discountPercentage}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm md:text-lg">Out of Stock</span>
          </div>
        )}

        {/* Like Button */}
        {/* <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 md:w-10 md:h-10 w-6 h-6 bg-gray-400/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:shadow-primary transition-colors duration-200 hover:scale-110 active:scale-90"
          aria-label={isLiked ? "Unlike" : "Like"}
          suppressHydrationWarning
        >
          <motion.svg
            className={`md:w-5 w-3 h-3 md:h-5 ${isLiked ? 'fill-primary stroke-primary' : 'fill-none stroke-primary'}`}
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
        </button> */}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="md:text-lg text-sm font-bold text-white line-clamp-2">
          {name}
        </h3>

        {/* Rating - Desktop only */}
        {rating > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            {reviews > 0 && (
              <span className="text-xs text-gray-400">({reviews})</span>
            )}
          </div>
        )}

        {/* Description - Desktop only */}
        {description && (
          <p className="hidden md:block text-xs text-gray-400 line-clamp-2">
            {description}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="md:text-xl text-sm font-bold text-primary">
                ${price}
              </p>
              {originalPrice && (
                <p className="text-xs md:text-sm text-gray-500 line-through">
                  ${originalPrice}
                </p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`md:w-12 w-8 h-8 md:h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 group ${
              inStock
                ? 'bg-gradient-to-br from-primary via-black via-70% to-black shadow-primary hover:shadow-xl hover:scale-110 active:scale-90'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
            aria-label={inStock ? "Add to cart" : "Out of stock"}
            suppressHydrationWarning
          >
            <motion.svg
              className="md:w-6 w-4 h-4 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              whileHover={inStock ? {
                y: [-1, 0, -1],
              } : {}}
              transition={{
                duration: 0.5,
                repeat: inStock ? Infinity : 0,
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
      </div>
    </motion.div>
  );
};

export default ProductCard;