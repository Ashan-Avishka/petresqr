'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import ProductCard from '../ui/ProductCard';
import Button from '../ui/Button';
import { useIsMobile } from '../../hooks/useIsMobile';
import { productAPI } from '../../api/product-api';
import { useCart } from '../../contexts/CartContext';
import type { Product } from '../../api/product-types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ProductsSliderSection: React.FC = () => {
    const sliderRef = useRef<Slider>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const { addItem } = useCart();

    const isMobile = useIsMobile(640);
    const isTablet = useIsMobile(1024);
    const isLaptop = useIsMobile(1280);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoadingProducts(true);
                const response = await productAPI.getProducts({
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    limit: 8,
                });
                if (response.ok && response.data) {
                    setProducts(response.data);
                }
            } catch (err) {
                console.error('Error loading products for slider:', err);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, []);

    const handleAddToCart = (id: string) => {
        const product = products.find(p => p._id === id);
        if (!product) return;

        const primaryImage = product.images?.find(img => img.isPrimary)?.url
            || product.images?.[0]?.url
            || '/images/tag-img.png';

        addItem({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: primaryImage,
            color: product.availableColors?.[0]?.name || '',
            size: product.availableSizes?.[0] || '',
            category: product.category,
            stock: product.stock || 0,
            quantity: 1,
        });
    };

    const getSlidesToShow = () => {
        if (isMobile) return 1;
        if (isTablet) return 2;
        if (isLaptop) return 3;
        return 4;
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: getSlidesToShow(),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: false,
        adaptiveHeight: false,
        customPaging: () => (
            <div className="slick-dot-wrapper">
                <div className="slick-dot-inner" />
            </div>
        ),
        dotsClass: 'slick-dots custom-dots',
    };

    const sectionHeader = (
        <div className="text-center mb-12 md:mt-20 mt-15">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
                Get Your Pet's Tag Today
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
            >
                Choose from our collection of premium QR tags designed to keep your furry friends safe
            </motion.p>
        </div>
    );

    // SSR skeleton
    if (!isClient) {
        return (
            <section className="md:py-20 py-10 bg-gradient-to-br from-black via-black/50 to-primary overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {sectionHeader}
                </div>
            </section>
        );
    }

    return (
        <section className="md:py-20 py-10 bg-gradient-to-br from-black via-black/50 to-primary overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {sectionHeader}

                {/* Slider Container */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Navigation Buttons */}
                    <AnimatePresence>
                        {isHovered && !loadingProducts && (
                            <>
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => sliderRef.current?.slickPrev()}
                                    className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-4 z-20 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-yellow-400 hover:to-amber-600 transition-all duration-300 group"
                                >
                                    <svg className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => sliderRef.current?.slickNext()}
                                    className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-4 z-20 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-yellow-400 hover:to-amber-600 transition-all duration-300 group"
                                >
                                    <svg className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </motion.button>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Loading skeletons */}
                    {loadingProducts ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                            {Array.from({ length: getSlidesToShow() }).map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/5 animate-pulse aspect-[3/4]" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="px-4"
                            key={`${isMobile}-${isTablet}-${isLaptop}`}
                        >
                            <Slider ref={sliderRef} {...settings}>
                                {products.map((product, index) => {
                                    const primaryImage = product.images?.find(img => img.isPrimary)?.url
                                        || product.images?.[0]?.url
                                        || '/images/tag-img.png';

                                    return (
                                        <div key={product._id} className="px-3 pb-10">
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
                                        </div>
                                    );
                                })}
                            </Slider>
                        </motion.div>
                    ) : null}
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center md:mt-20 mt-10"
                >
                    <Button variant="primary" size="md">
                        View All Products
                    </Button>
                </motion.div>
            </div>

            <style jsx global>{`
                .custom-dots {
                    bottom: -40px !important;
                    display: flex !important;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .custom-dots li { margin: 0; padding: 0; width: auto; height: auto; }
                .custom-dots li button { display: none; }
                .slick-dot-wrapper {
                    width: 8px;
                    height: 8px;
                    border-radius: 9999px;
                    background: #d1d5db;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    margin-top: -40px;
                }
                .slick-dot-wrapper:hover { background: #9ca3af; }
                .custom-dots li.slick-active .slick-dot-wrapper {
                    width: 32px;
                    background: linear-gradient(to right, #fbbf24, #d97706);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .slick-slide > div { margin: 0 8px; }
                .slick-list { margin: 0 -8px; }
            `}</style>
        </section>
    );
};

export default ProductsSliderSection;