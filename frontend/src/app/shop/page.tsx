"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroHeader from '../../../components/ui/PageHero';
import ProductCard from '../../../components/ui/ProductCard';
import { productAPI } from '../../../api/product-api';
import { useCart } from '../../../contexts/CartContext';
import type { Product } from '../../../api/product-types';

type FilterType = 'all' | 'tag' | 'toy' | 'accessory';

export default function TagsGalleryPage() {
    const [activeTab, setActiveTab] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cartNotification, setCartNotification] = useState<string | null>(null);
    const hasLoadedOnce = useRef(false);
    const { addItem } = useCart();

    const tabs: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'tag', label: 'Tags' },
        { id: 'toy', label: 'Toys' },
        { id: 'accessory', label: 'Accessories' }
    ];
    const itemsPerPage = 120;

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                if (!hasLoadedOnce.current) {
                    setLoading(true);
                } else {
                    setFiltering(true);
                }
                setError(null);

const params: any = {
    limit: itemsPerPage,        // ← add this
    sortBy: 'createdAt',
    sortOrder: 'desc' as const
};


                if (activeTab !== 'all') params.category = activeTab;
                if (searchQuery.trim()) params.search = searchQuery.trim();

                const response = await productAPI.getProducts(params);

                if (cancelled) return;

                if (response.ok && response.data) {
                    setAllProducts(response.data);
                } else {
                    setError('Failed to load products');
                    setAllProducts([]);
                }
            } catch (err) {
                if (cancelled) return;
                console.error('Error loading products:', err);
                setError('An error occurred while loading products');
                setAllProducts([]);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setFiltering(false);
                    hasLoadedOnce.current = true;
                }
            }
        };

        loadProducts();
        return () => { cancelled = true; };
    }, [activeTab, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(allProducts.length / itemsPerPage));
    const paginatedProducts = allProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
        return pages;
    };

    const handleAddToCart = (id: string) => {
        const product = allProducts.find(p => p._id === id);
        if (!product) return;

        const primaryImage = product.images?.find(img => img.isPrimary)?.url
            || product.images?.[0]?.url
            || '/images/tag-img.png';

        // Auto-select first available color and size
        const defaultColor = product.availableColors?.[0]?.name || '';
        const defaultSize = product.availableSizes?.[0] || '';

        addItem({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: primaryImage,
            color: defaultColor,
            size: defaultSize,
            category: product.category,
            stock: product.stock || 0,
            quantity: 1
        });

        // Show toast notification with product name
        setCartNotification(product.name);
        setTimeout(() => setCartNotification(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
                <div className="text-white text-xl">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black">
            <HeroHeader
                backgroundImage="./images/page-hero1.png"
                title="Premium QR Pet Tags"
                subtitle="Discover our collection of smart QR tags designed to keep your pets safe. Each tag comes with lifetime protection and instant scanning."
            >
                <div className="md:max-w-4xl max-w-[350px] -mt-10 mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-full shadow-lg p-2 flex md:flex-row flex-col md:items-center gap-2">
                    <div className="pl-15 md:pl-2 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 md:px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-br from-primary via-black via-70% to-black text-white shadow-md shadow-primary'
                                        : 'text-gray-300 hover:shadow-sm hover:shadow-primary hover:bg-white/10'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:block h-8 w-px bg-gray-400"></div>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-4 pr-10 py-2 bg-transparent text-gray-300 placeholder-gray-400 focus:outline-none"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </HeroHeader>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-20 py-10 md:pb-40 pb-20">
                <div className="mb-6 text-gray-300 text-center">
                    Showing {paginatedProducts.length} of {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'}
                </div>

                {error && (
                    <div className="text-center py-8">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!error && allProducts.length > 0 ? (
                    <>
                        {filtering ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                                {Array.from({ length: itemsPerPage }).map((_, i) => (
                                    <div key={i} className="rounded-2xl bg-white/5 animate-pulse aspect-[3/4]" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                                {paginatedProducts.map((product, index) => {
                                    const primaryImage = product.images?.find(img => img.isPrimary)?.url
                                        || product.images?.[0]?.url
                                        || '/images/tag-img.png';

                                    return (
                                        <Link key={product._id} href={`/shop/${product.slug}`}>
                                            <ProductCard
                                                id={product._id}
                                                name={product.name}
                                                price={product.price}
                                                originalPrice={product.compareAtPrice}
                                                image={primaryImage}
                                                description={product.description || ''}
                                                rating={product.rating || 0}
                                                reviews={product.reviews || 0}
                                                badge={product.badge}
                                                inStock={product.availability === 'in_stock' && (product.stock || 0) > 0}
                                                onAddToCart={handleAddToCart}
                                                index={index}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1 md:gap-2 mt-12">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg transition-all text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="text-gray-500 px-2">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`w-8 h-8 rounded-full font-medium transition-all ${
                                                currentPage === page
                                                    ? 'text-white shadow-md shadow-primary'
                                                    : 'text-gray-300 hover:bg-white/10'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg transition-all text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : !error && (
                    <div className="text-center py-16">
                        <p className="text-slate-400 text-lg">No products found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setActiveTab('all');
                                setSearchQuery('');
                            }}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Cart toast notification */}
            <AnimatePresence>
                {cartNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-100 flex items-center gap-2 max-w-xs"
                    >
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium line-clamp-1">
                            {cartNotification} added to cart!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}