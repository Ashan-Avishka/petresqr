// app/tags/page.tsx - Tags Gallery Page
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import HeroHeader from '../../../components/ui/PageHero';
import ProductCard from '../../../components/ui/ProductCard';
import { productAPI } from '../../../api/product-api';
import type { Product, PetCategory } from '../../../api/product-types';

type FilterType = 'all' | 'dogs' | 'cats' | 'others';

export default function TagsGalleryPage() {
    const [activeTab, setActiveTab] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [tags, setTags] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const tabs: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'dogs', label: 'Dogs' },
        { id: 'cats', label: 'Cats' },
        { id: 'others', label: 'Others' }
    ];
    const itemsPerPage = 6;

    // Load tags data on mount and when filters change
    useEffect(() => {
        const loadTags = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query parameters
                const params: any = {
                    category: 'tag', // Only fetch tags
                    page: currentPage,
                    limit: itemsPerPage,
                    sortBy: 'createdAt',
                    sortOrder: 'desc' as const
                };

                // Add pet category filter if not 'all'
                if (activeTab !== 'all') {
                    params.petCategory = activeTab as PetCategory;
                }

                // Add search query if provided
                if (searchQuery.trim()) {
                    params.search = searchQuery.trim();
                }

                const response = await productAPI.getProducts(params);

                if (response.ok && response.data) {
                    setTags(response.data);
                } else {
                    setError('Failed to load tags');
                    setTags([]);
                }
            } catch (err) {
                console.error('Error loading tags:', err);
                setError('An error occurred while loading tags');
                setTags([]);
            } finally {
                setLoading(false);
            }
        };

        loadTags();
    }, [activeTab, searchQuery, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    // Calculate total pages (simplified for now - you can add total count from pagination)
    const totalPages = Math.max(1, Math.ceil(tags.length / itemsPerPage));

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
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
        console.log('Adding to cart:', id);
        // Add your cart logic here
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black flex items-center justify-center">
                <div className="text-white text-xl">Loading tags...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-black to-black">
            {/* Hero Header with Tabs and Search */}
            <HeroHeader
                backgroundImage="./images/page-hero1.png"
                title="Premium QR Pet Tags"
                subtitle="Discover our collection of smart QR tags designed to keep your pets safe. Each tag comes with lifetime protection and instant scanning."
            >
                {/* Combined Tabs and Search */}
                <div className="md:max-w-4xl max-w-[350px] -mt-10 mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-full shadow-lg p-2 flex md:flex-row flex-col md:items-center gap-2">
                    {/* Tabs */}
                    <div className="pl-15 md:pl-2 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 md:px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-br from-primary via-black via-70% to-black text-white shadow-md shadow-primary'
                                        : 'text-gray-300 hover:shadow-sm hover:shadow-primary hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
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
                            placeholder="Search tags..."
                            className="w-full pl-4 pr-10 py-2 bg-transparent text-gray-300 placeholder-gray-400 focus:outline-none"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </HeroHeader>

            {/* Tags Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-20 py-10 md:pb-40 pb-20">
                {/* Results count */}
                <div className="mb-6 text-gray-300 text-center">
                    Showing {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
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

                {!error && tags.length > 0 ? (
                    <>
                        {/* Grid: 2 columns on mobile, 3 on lg */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                            {tags.map((tag, index) => {
                                const primaryImage = tag.images?.find(img => img.isPrimary)?.url || tag.images?.[0]?.url || '../../public/images/tag-img.png';
                                const discountPercentage = tag.compareAtPrice
                                    ? Math.round(((tag.compareAtPrice - tag.price) / tag.compareAtPrice) * 100)
                                    : undefined;

                                return (
                                    <Link key={tag._id} href={`/tags/${tag.slug}`}>
                                        <ProductCard
                                            id={tag._id}
                                            name={tag.name}
                                            price={tag.price}
                                            originalPrice={tag.compareAtPrice}
                                            image={primaryImage}
                                            description={tag.description || ''}
                                            rating={tag.rating || 0}
                                            reviews={tag.reviews || 0}
                                            badge={tag.badge}
                                            inStock={tag.availability === 'in_stock' && (tag.stock || 0) > 0}
                                            onAddToCart={handleAddToCart}
                                            index={index}
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
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
                                            className={`w-8 h-8 rounded-full font-medium transition-all ${currentPage === page
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
                        <p className="text-slate-400 text-lg">No tags found matching your criteria.</p>
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
}