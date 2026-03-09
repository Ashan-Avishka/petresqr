'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Check, Heart, Share2, ShoppingCart, Package, Shield, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../../contexts/CartContext';
import { productAPI } from '../../../../api/product-api';
import type { Product } from '../../../../api/product-types';
import { getImageUrl } from '../../../../api/config';

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const { addItem, isInCart } = useCart();
  const [showCartNotification, setShowCartNotification] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const slug = params.slug as string;
        const response = await productAPI.getProductBySlug(slug);

        if (response.ok && response.data) {
          const data = response.data;
          setProduct(data);

          if (data.availableColors && data.availableColors.length > 0) {
            setSelectedColor(data.availableColors[0].name);
          }
          if (data.availableSizes && data.availableSizes.length > 0) {
            setSelectedSize(data.availableSizes[0]);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadProduct();
    }
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.availableColors && product.availableColors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    if (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '/placeholder-product.jpg';

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage,
      color: selectedColor,
      size: selectedSize,
      category: product.category,
      stock: product.stock || 0,
      quantity
    });

    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">{error || 'Product not found'}</h2>
          <button
            onClick={() => router.push('/tags')}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.url)
    : ['/placeholder-product.jpg'];

  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const isInStock = product.availability === 'in_stock' && (product.stock || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black pb-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-16">
        {/* Back Button */}
        <button
          onClick={() => router.push('/tags')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Back to Products</span>
        </button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 md:space-y-4">
            {/* Main Image */}
            <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden aspect-square">
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className={`absolute top-3 md:top-4 right-3 md:right-4 px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${
                  product.badge === 'bestseller' ? 'bg-orange-500' :
                  product.badge === 'new' ? 'bg-green-500' :
                  product.badge === 'sale' ? 'bg-red-500' :
                  'bg-primary'
                }`}>
                  {product.badge.toUpperCase()}
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
                    <img src={getImageUrl(img)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Tabs Section */}
            <div className="mt-10 md:mt-16 h-120">
              <div className="flex gap-2 md:gap-4 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
                {(['description', 'specifications', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 md:px-6 py-2 md:py-3 font-medium transition-colors relative whitespace-nowrap text-sm md:text-base capitalize ${
                      activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'reviews' ? `Reviews (${product.reviews || 0})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 md:p-4">
                {activeTab === 'description' && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 text-sm md:text-lg leading-relaxed">
                      {product.description || 'No description available.'}
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="space-y-2 md:space-y-3">
                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-gray-400 capitalize text-sm md:text-base font-medium">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-white font-semibold text-sm md:text-base">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                    {product.dimensions && (
                      <div className="bg-white/5 rounded-lg p-3 md:p-4 flex justify-between items-center">
                        <span className="text-gray-400 text-sm md:text-base font-medium">Dimensions</span>
                        <span className="text-white font-semibold text-sm md:text-base">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}cm
                        </span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="bg-white/5 rounded-lg p-3 md:p-4 flex justify-between items-center">
                        <span className="text-gray-400 text-sm md:text-base font-medium">Weight</span>
                        <span className="text-white font-semibold text-sm md:text-base">{product.weight}g</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-8 md:py-12">
                    <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                      {product.rating ? `${product.rating.toFixed(1)} out of 5 stars` : 'No ratings yet'}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base">
                      Based on {product.reviews || 0} reviews
                    </p>
                    <p className="text-gray-500 mt-4 text-sm md:text-base">Review system coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">{product.name}</h1>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 md:w-5 md:h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm md:text-base text-gray-300">
                    {product.rating.toFixed(1)} ({product.reviews || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg md:text-xl text-gray-500 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm md:text-base ${
              isInStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-medium">
                {isInStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">{product.description}</p>
            )}

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm md:text-base">
                  Size: {selectedSize || 'Select a size'}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
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
            )}

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm md:text-base">
                  Color: {selectedColor || 'Select a color'}
                </h3>
                <div className="flex gap-2 md:gap-3 flex-wrap">
                  {product.availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color.name
                          ? 'border-primary scale-110 shadow-lg shadow-primary/50'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-white absolute inset-0 m-auto drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white text-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2 md:gap-3">
                <button
                  disabled={!isInStock}
                  onClick={handleAddToCart}
                  className="px-8 sm:px-37 py-2 sm:py-4 bg-gradient-to-br from-primary to-black shadow-primary text-white text-base sm:text-lg rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap hover:cursor-pointer hover:shadow-md hover:scale-105"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">
                    {isInCart(product._id) ? 'Update Cart' : 'Add to Cart'}
                  </span>
                  <span className="sm:hidden">
                    {isInCart(product._id) ? 'Update' : 'Add'}
                  </span>
                </button>
                <button className="px-4 md:px-6 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="px-4 md:px-6 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 space-y-2 md:space-y-3">
                <h3 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Key Features</h3>
                {product.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="flex flex-col items-center text-center p-3 md:p-4 bg-white/5 rounded-lg">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <span className="text-xs md:text-sm text-gray-300">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 md:p-4 bg-white/5 rounded-lg">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <span className="text-xs md:text-sm text-gray-300">
                  {product.specifications?.warranty || 'Warranty'}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 md:p-4 bg-white/5 rounded-lg">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1 md:mb-2" />
                <span className="text-xs md:text-sm text-gray-300">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Notification */}
      {showCartNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Added to cart!</span>
        </motion.div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;