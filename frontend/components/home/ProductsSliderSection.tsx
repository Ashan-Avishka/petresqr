'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import ProductCard from '../ui/ProductCard';
import Button from '../ui/Button';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
}

const ProductsSliderSection: React.FC = () => {
    const sliderRef = useRef<Slider>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Sample products data - replace with your actual products
    const products: Product[] = [
        {
            id: '1',
            name: 'Classic QR Tag',
            price: 29,
            image: '/images/tag-img.png',
        },
        {
            id: '2',
            name: 'Premium Metal Tag',
            price: 45,
            image: '/images/tag-img.png',
        },
        {
            id: '3',
            name: 'Designer Tag Pro',
            price: 59,
            image: '/images/tag-img.png',
        },
        {
            id: '4',
            name: 'Smart LED Tag',
            price: 75,
            image: '/images/tag-img.png',
        },
        {
            id: '5',
            name: 'Waterproof Tag Plus',
            price: 39,
            image: '/images/tag-img.png',
        },
        {
            id: '6',
            name: 'Deluxe Engraved Tag',
            price: 55,
            image: '/images/tag-img.png',
        },
    ];

    const handleAddToCart = (productId: string) => {
        console.log('Added to cart:', productId);
        // Add your cart logic here
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: false,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
        customPaging: () => (
            <div className="slick-dot-wrapper">
                <div className="slick-dot-inner" />
            </div>
        ),
        dotsClass: 'slick-dots custom-dots',
    };

    const handlePrevious = () => {
        sliderRef.current?.slickPrev();
    };

    const handleNext = () => {
        sliderRef.current?.slickNext();
    };

    return (
        <section className="py-20 bg-gradient-to-tr from-amber-50 via-amber-100 to-primary overflow-hidden relative">
            {/* Background decoration */}
            {/* <div className="absolute top-10 right-0 w-72 h-72 bg-yellow-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl" /> */}

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12 mt-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
                    >
                        Get Your Pet's Tag Today
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        Choose from our collection of premium QR tags designed to keep your furry friends safe
                    </motion.p>
                </div>

                {/* Slider Container */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Navigation Buttons - Only visible on hover */}
                    <AnimatePresence>
                        {isHovered && (
                            <>
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handlePrevious}
                                    className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-4 z-20 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-yellow-400 hover:to-amber-600 transition-all duration-300 group"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleNext}
                                    className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-4 z-20 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-yellow-400 hover:to-amber-600 transition-all duration-300 group"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </motion.button>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Products Slider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="px-4"
                    >
                        <Slider ref={sliderRef} {...settings}>
                            {products.map((product) => (
                                <div key={product.id} className="px-3 pb-10">
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        image={product.image}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>
                            ))}
                        </Slider>
                    </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mt-20"
                >
                    <Button
                        variant="primary"
                        size="md"
                    >
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
                
                .custom-dots li {
                    margin: 0;
                    padding: 0;
                    width: auto;
                    height: auto;
                }
                
                .custom-dots li button {
                    display: none;
                }
                
                .slick-dot-wrapper {
                    width: 8px;
                    height: 8px;
                    border-radius: 9999px;
                    background: #d1d5db;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    margin-top: -40px;
                }
                
                .slick-dot-wrapper:hover {
                    background: #9ca3af;
                }
                
                .custom-dots li.slick-active .slick-dot-wrapper {
                    width: 32px;
                    background: linear-gradient(to right, #fbbf24, #d97706);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .slick-slide > div {
                    margin: 0 8px;
                }
                
                .slick-list {
                    margin: 0 -8px;
                }
            `}</style>
        </section>
    );
};

export default ProductsSliderSection;