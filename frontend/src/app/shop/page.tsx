"use client";

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../../components/ui/ProductCard';
import HeroHeader from '../../../components/ui/PageHero';

// Main Gallery Page
export default function ProductGalleryPage() {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const tabs = ['All', 'Dogs', 'Cats', 'Others'];
    const itemsPerPage = 6;

    const allProducts = [
        { id: '1', name: 'Classic QR Tag', price: 29, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '2', name: 'Premium Metal Tag', price: 45, image: '/images/tag-img.png', category: 'Cats' },
        { id: '3', name: 'Designer Tag Pro', price: 59, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '4', name: 'Smart LED Tag', price: 75, image: '/images/tag-img.png', category: 'Others' },
        { id: '5', name: 'Waterproof Tag Plus', price: 39, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '6', name: 'Deluxe Engraved Tag', price: 55, image: '/images/tag-img.png', category: 'Cats' },
        { id: '7', name: 'Bone Shape Tag', price: 35, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '8', name: 'Fish Shape Tag', price: 35, image: '/images/tag-img.png', category: 'Cats' },
        { id: '9', name: 'Glow in Dark Tag', price: 49, image: '/images/tag-img.png', category: 'Others' },
        { id: '10', name: 'Paw Print Tag', price: 32, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '11', name: 'Luxury Diamond Tag', price: 99, image: '/images/tag-img.png', category: 'Cats' },
        { id: '12', name: 'Basic Round Tag', price: 19, image: '/images/tag-img.png', category: 'Others' },
        { id: '13', name: 'Heart Shape Tag', price: 29, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '14', name: 'Star Shape Tag', price: 29, image: '/images/tag-img.png', category: 'Cats' },
        { id: '15', name: 'Custom Photo Tag', price: 65, image: '/images/tag-img.png', category: 'Others' },
        { id: '16', name: 'Military Style Tag', price: 42, image: '/images/tag-img.png', category: 'Dogs' },
        { id: '17', name: 'Collar Bell Tag', price: 25, image: '/images/tag-img.png', category: 'Cats' },
        { id: '18', name: 'GPS Tracker Tag', price: 120, image: '/images/tag-img.png', category: 'Others' },
    ];

    // Filter products by tab and search query
    const filteredProducts = useMemo(() => {
        let filtered = allProducts;

        // Filter by category tab
        if (activeTab !== 'All') {
            filtered = filtered.filter(product => product.category === activeTab);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [activeTab, searchQuery]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Header with Tabs and Search */}
            <HeroHeader
                backgroundImage="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
                title="Lorem ipsum dolor"
                subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            >
                {/* Combined Tabs and Search */}
                <div className="max-w-4xl mx-auto bg-white rounded-full shadow-lg p-2 flex items-center gap-2">
                    {/* Tabs */}
                    <div className="flex items-center gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === tab
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-200"></div>

                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tag in here..."
                            className="w-full pl-4 pr-10 py-2 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </HeroHeader>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Results count */}
                <div className="mb-6 text-slate-600 text-center">
                    Showing {currentProducts.length} of {filteredProducts.length} products
                </div>

                {currentProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentProducts.map((product) => (
                                <div key={product.id} className="px-3 pb-10">
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        image={product.image}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="text-slate-600 px-2">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded font-medium transition-colors ${currentPage === page
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-600 text-lg">No products found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}