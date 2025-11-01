'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import HydrationSafeButton from '../ui/HydrationSafeButton';

export default function GoldenTagPromo() {
    return (
        <section className="relative md:bg-gradient-to-r bg-gradient-to-tr from-primary md:via-primary/50 via-black to-black  overflow-hidden">
            {/* Floating decorative elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute md:top-20 top-35 left-10 md:text-black text-primary opacity-30"
            >
                <Sparkles size={40} />
            </motion.div>

            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute md:bottom-20 bottom-0 md:left-40 left-10 text-black opacity-20"
            >
                <Sparkles size={60} />
            </motion.div>

            <motion.div
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 3, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute md:top-40 top-90 md:right-32 right-10 text-primary opacity-30"
            >
                <Sparkles size={50} />
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8 md:mt-20 mt-10"
                    >
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-200 text-lg md:mb-4"
                            >
                                Shop & Win a
                            </motion.p>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-[45px] md:text-6xl lg:text-7xl font-bold text-white"
                            >
                                24K Golden Tag !
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-200 text-lg leading-relaxed max-w-xl"
                        >
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus imperdiet sed id elementum. Quam vel aliquam sit vulputate. Faucibus nec gravida ipsum pulvinar vel non.
                        </motion.p>

                        <HydrationSafeButton
                        icon={ShoppingBag}
                        whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 0 20px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" 
                        }}
                        className="text-lg md:shadow-xl"
                        >
                        Shop Now
                        </HydrationSafeButton>
                    </motion.div>

                    {/* Right Content - Golden Tag */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative flex justify-center items-center"
                    >
                        {/* Outer rotating ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute w-96 h-96 md:w-[450px] md:h-[450px] rounded-full border-2 border-primary opacity-30 mt-20"
                        />

                        {/* Main decorative circle with stars */}
                        <div className="relative">
                            {/* Top left star */}
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute top-10 -left-8 text-primary"
                            >
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                                </svg>
                            </motion.div>

                            {/* Bottom right star */}
                            <motion.div
                                animate={{
                                    rotate: [360, 0],
                                    scale: [1, 1.3, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute -bottom-10 -right-10 text-amber-400"
                            >
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                                </svg>
                            </motion.div>

                            {/* White circle container */}
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative bg-gradient-to-tr shadow-primary from-black via-black/50 to-primary rounded-full w-80 h-80 md:w-96 md:h-96 shadow-2xl flex items-center justify-center mt-20"
                            >

                                {/* Dog bone tag */}
                                <div className="relative mt-12">
                                    <img src="/images/tag-img.png" alt="" className='w-80 -mt-15' />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}