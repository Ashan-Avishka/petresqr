'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';

export default function GoldenTagPromo() {
    return (
        <section className="relative bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50 overflow-hidden">
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
                className="absolute top-20 left-10 text-amber-400 opacity-30"
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
                className="absolute bottom-20 left-40 text-amber-400 opacity-20"
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
                className="absolute top-40 right-32 text-amber-400 opacity-25"
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
                        className="space-y-8 mt-20 "
                    >
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-700 text-lg mb-4"
                            >
                                Shop & Win a
                            </motion.p>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
                            >
                                24K Golden Tag !
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-600 text-lg leading-relaxed max-w-xl"
                        >
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus imperdiet sed id elementum. Quam vel aliquam sit vulputate. Faucibus nec gravida ipsum pulvinar vel non.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className='w-38'
                        >
                            <Button
                                variant="primary"
                                size="lg"
                            >
                                Shop Now
                            </Button>
                        </motion.div>
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
                            className="absolute w-96 h-96 md:w-[450px] md:h-[450px] rounded-full border-2 border-amber-300 opacity-30 mt-20"
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
                                className="absolute top-10 -left-8 text-amber-400"
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
                                className="relative bg-white rounded-full w-80 h-80 md:w-96 md:h-96 shadow-2xl flex items-center justify-center mt-20"
                            >
                                {/* Golden ring at top */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute -top-6 w-32 h-32"
                                >
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-full border-8 border-amber-600 shadow-lg" />
                                        <div className="absolute -inset-5 w-35 h-90 -mt-52  ml-1  rounded-full border-4 border-amber-400" />
                                    </div>
                                </motion.div>

                                {/* Dog bone tag */}
                                <div className="relative mt-12">
                                    {/* Bone shape */}
                                    {/* <div className="relative">
                    <svg width="240" height="140" viewBox="0 0 240 140" className="drop-shadow-xl">
                      
                      <rect x="80" y="55" width="80" height="30" rx="15" fill="#E8D4B8" />
                      
                      
                      <circle cx="70" cy="70" r="30" fill="#E8D4B8" />
                      <circle cx="60" cy="70" r="20" fill="#D4C5A9" />
                      
                      
                      <circle cx="170" cy="70" r="30" fill="#E8D4B8" />
                      <circle cx="180" cy="70" r="20" fill="#D4C5A9" />
                    </svg>

                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-amber-800 font-bold text-2xl tracking-widest">
                        TUCKER
                      </span>
                    </div>
                  </div> */}
                                    <img src="/images/tag-img.png" alt="" className='w-80 -mt-15' />
                                </div>

                                {/* Subtle shimmer effect */}
                                <motion.div
                                    animate={{
                                        x: ["-100%", "100%"],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 rounded-full overflow-hidden opacity-20"
                                >
                                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}