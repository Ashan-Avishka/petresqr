'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Check, Heart, Share2, ShoppingCart, Package, Shield, Truck, ArrowLeft } from 'lucide-react';
import { getTagBySlug, Tag } from '../../../../lib/tags';

const TagDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Large'>('Small');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  const availableColors = [
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#F59E0B' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Black', hex: '#1F2937' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Silver', hex: '#9CA3AF' },
    { name: 'Gold', hex: '#D97706' }
  ];

  const sizes = ['Small', 'Large'];

  useEffect(() => {
    const loadTag = async () => {
      try {
        const slug = params.slug as string;
        const tagData = await getTagBySlug(slug);
        if (tagData) {
          setTag(tagData);
          setSelectedColor(availableColors[0].name);
        }
      } catch (error) {
        console.error('Error loading tag:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTag();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Tag not found</h2>
          <button
            onClick={() => router.push('/tags')}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Back to Tags
          </button>
        </div>
      </div>
    );
  }

  const images = tag.images || [tag.image];
  const discountPercentage = tag.originalPrice
    ? Math.round(((tag.originalPrice - tag.price) / tag.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black pb-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-16">
        {/* Back Button */}
        <button
          onClick={() => router.push('/tags')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Back to Tags</span>
        </button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            {/* Main Image */}
            <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden aspect-square">
              <img
                src={images[selectedImage]}
                alt={tag.name}
                className="w-full h-full object-cover"
              />
              {tag.badge && (
                <div className={`absolute top-3 md:top-4 right-3 md:right-4 px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${
                  tag.badge === 'bestseller' ? 'bg-orange-500' :
                  tag.badge === 'new' ? 'bg-green-500' :
                  tag.badge === 'sale' ? 'bg-red-500' :
                  'bg-primary'
                }`}>
                  {tag.badge.toUpperCase()}
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="absolute top-3 md:top-4 left-3 md:left-4 px-2 md:px-3 py-1 rounded-full bg-red-500 text-white text-xs md:text-sm font-medium">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary shadow-lg shadow-primary/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`${tag.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">{tag.name}</h1>
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        i < Math.floor(tag.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm md:text-base text-gray-300">{tag.rating} ({tag.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">${tag.price}</span>
                {tag.originalPrice && (
                  <span className="text-lg md:text-xl text-gray-500 line-through">${tag.originalPrice}</span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm md:text-base ${
              tag.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${tag.inStock ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-medium">{tag.inStock ? 'In Stock' : 'Out of Stock'}</span>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">{tag.description}</p>

            {/* Size Selection */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Size: {selectedSize}</h3>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size as 'Small' | 'Large')}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-lg border-2 transition-all text-sm md:text-base font-medium ${
                      selectedSize === size
                        ? 'border-primary bg-primary/20 text-white scale-105'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:scale-105'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Color: {selectedColor}</h3>
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {availableColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === color.name
                        ? 'border-primary scale-110 shadow-lg shadow-primary/50'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white text-xl transition-colors"
                >
                  -
                </button>
                <span className="text-white font-semibold w-12 md:w-16 text-center text-lg md:text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white text-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-3">
              <button
                disabled={!tag.inStock}
                className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-br shadow-primary from-primary to-black shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm md:text-base hover:shadow-lg hover:scale-105 transition-all"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button className="px-4 md:px-6 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="px-4 md:px-6 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 space-y-2 md:space-y-3">
              <h3 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Key Features</h3>
              {tag.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="flex flex-col items-center text-center p-3 md:p-4 bg-white/5 rounded-lg">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <span className="text-xs md:text-sm text-gray-300">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 md:p-4 bg-white/5 rounded-lg">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <span className="text-xs md:text-sm text-gray-300">{tag.specifications.warranty} Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 md:p-4 bg-white/5 rounded-lg">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <span className="text-xs md:text-sm text-gray-300">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        {/* <div className="mt-10 md:mt-16">
          <div className="flex gap-2 md:gap-4 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 md:px-6 py-2 md:py-3 font-medium transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'description' ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Description
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-4 md:px-6 py-2 md:py-3 font-medium transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'specifications' ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Specifications
              {activeTab === 'specifications' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 md:px-6 py-2 md:py-3 font-medium transition-colors relative whitespace-nowrap text-sm md:text-base ${
                activeTab === 'reviews' ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Reviews ({tag.reviews})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-sm md:text-lg leading-relaxed">{tag.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3 md:space-y-4">
                {Object.entries(tag.specifications).map(([key, value]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-3 md:p-4 flex justify-between items-center">
                    <span className="text-gray-400 capitalize text-sm md:text-base font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-white font-semibold text-sm md:text-base">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </span>
                  </div>
                ))}
                {tag.dimensions && (
                  <div className="bg-white/5 rounded-lg p-3 md:p-4 flex justify-between items-center">
                    <span className="text-gray-400 text-sm md:text-base font-medium">Dimensions</span>
                    <span className="text-white font-semibold text-sm md:text-base">
                      {tag.dimensions.length} × {tag.dimensions.width} × {tag.dimensions.thickness}mm
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8 md:py-12">
                <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                  {tag.rating} out of 5 stars
                </h3>
                <p className="text-gray-400 text-sm md:text-base">Based on {tag.reviews} reviews</p>
                <p className="text-gray-500 mt-4 text-sm md:text-base">Review system coming soon...</p>
              </div>
            )}
          </div>
        </div> */}
      </div>

      <style>{`
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

export default TagDetailPage;