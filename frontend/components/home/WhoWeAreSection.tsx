'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useIsMobile } from '../../hooks/useIsMobile'; // Adjust path as needed

interface StatItemProps {
    icon: React.ReactNode;
    number: string;
    label: string;
    delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, number, label, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="flex flex-col items-center justify-center gap-3"
        >
            <motion.div
                whileHover={{ scale: 1.1 }}
                className="md:w-20 md:h-20 w-15 h-15 rounded-3xl bg-gradient-to-br from-primary via-black via-60% to-black flex items-center justify-center shadow-lg shadow-primary"
            >
                {icon}
            </motion.div>
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="md:text-4xl text-2xl font-bold md:mt-4 text-gray-300 text-center"
            >
                {number}
            </motion.div>
            <p className="text-xs md:text-sm font-medium text-gray-400 text-center -mt-2">{label}</p>
        </motion.div>
    );
};

const WhoWeAreSection: React.FC = () => {
    const isMobile = useIsMobile();

    const stats = [
        {
            icon: (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            number: "50,000+",
            label: "Protected Pets"
        },
        {
            icon: (
                <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            number: "25,000+",
            label: "Happy Families"
        },
        {
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            number: "98%",
            label: "Success Rate"
        },
        {
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            number: "24/7",
            label: "Support Available"
        },
        {
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            number: "24/7",
            label: "Support Available"
        }
    ];

    // Show only 3 stats on mobile
    const displayStats = isMobile ? stats.slice(0, 3) : stats;

    return (
        <section className="pt-20 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Stats Section */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-8 md:gap-12 md:mb-30 mb-20 place-items-center">
                    {displayStats.map((stat, index) => (
                        <StatItem
                            key={index}
                            icon={stat.icon}
                            number={stat.number}
                            label={stat.label}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                <div className="backdrop-blur-2xl p-3 mx-auto">
                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 text-white"
                    >
                        Who We Are
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-base md:text-lg text-gray-400 text-center max-w-4xl mx-auto leading-relaxed"
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </motion.p> 
                </div>

                {/* Dogs Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative w-full max-w-5xl mx-auto h-[300px] md:h-[400px] lg:h-[500px] md:-mt-20 -mt-30"
                >
                    <Image
                        src="/images/who-we-are-img.png"
                        alt="Group of happy dogs"
                        fill
                        className="object-contain object-bottom"
                        priority
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default WhoWeAreSection;