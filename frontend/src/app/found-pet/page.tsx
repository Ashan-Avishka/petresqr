"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, } from 'lucide-react';
import HeroHeader from '../../../components/ui/PageHero';
import FundingCTA from '../../../components/home/FundingSection';

export default function LostPetPage() {

    const steps = [
        {
            number: "01",
            text: "Scan the QR Code on the pet tag using your phones camera Or Enter the code in the app."
        },
        {
            number: "02",
            text: "You'll instantly see the pet's profile — name, photo, and important details."
        },
        {
            number: "03",
            text: "The system's contact information will appear here — so you can reach them right away."
        },
        {
            number: "04",
            text: "Help reunite a lost pet with their loving home."
        }
    ];

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br bg-primary via-black to-black">
            {/* Hero Header */}
            <HeroHeader
                backgroundImage="./images/page-hero8.png"
                title="Lorem ipsum dolor"
                subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            ></HeroHeader>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Instructions Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="mb-8 mt-10 sm:mt-16 lg:mt-20"
                >
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Pet Image */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative col-span-3 md:col-span-2"
                        >
                            <div className="overflow-hidden rounded-2xl">
                                <img
                                    src="./images/instructions-img.jpg"
                                    alt="Lost pet"
                                    className="w-full h-100 sm:h-96 lg:h-160 object-center object-cover"
                                />
                            </div>
                        </motion.div>

                        {/* Instructions */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col justify-center md:-ml-20 lg:-ml-60 col-span-3 md:col-span-1 -mt-30 md:mt-0"
                        >
                            <div className='bg-black/20 backdrop-blur-sm border border-gray-500/50 rounded-2xl p-6 sm:p-8 shadow-xl'>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black via-primary to-primary mb-4 sm:mb-6 leading-tight"
                                >
                                    Looks like a furry friend
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-primary to-primary">
                                        needs help getting home!
                                    </span>
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 }}
                                    className="text-white text-sm mb-6"
                                >
                                    You've just met your new furry hero by scanning this pet with their family.
                                </motion.p>

                                {/* Steps */}
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="space-y-4 mt-6 sm:mt-10"
                                >
                                    {steps.map((step, index) => (
                                        <motion.div
                                            key={step.number}
                                            variants={fadeInUp}
                                            transition={{ duration: 0.5 }}
                                            className="flex gap-3 sm:gap-4 mt-4 sm:mt-6"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 sm:w-15 sm:h-15 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 text-lg sm:text-2xl">
                                                {step.number}
                                            </div>
                                            <p className="text-gray-300 text-base sm:text-lg lg:text-xl pt-1 sm:pt-2">{step.text}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* QR Code Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="grid md:grid-cols-2 gap-6 bg-gradient-to-br md:h-83 from-primary via-black to-black rounded-3xl border border-primary shadow-lg shadow-primary mt-10 sm:mt-32 lg:mt-40 mb-6 sm:mb-16 lg:mb-20 p-6 sm:p-8 lg:p-0"
                >
                    {/* QR Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:pl-8 flex flex-col justify-center py-6 sm:py-8 lg:-mt-30"
                    >
                        <div className="flex flex-row sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                                className="bg-black p-2 rounded-xl shadow-lg shadow-primary"
                            >
                                <QrCode className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 text-primary" />
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-white text-2xl sm:text-3xl lg:text-5xl leading-tight">
                                    Click here to scan <br className="hidden sm:block" /> the QR code
                                </h3>
                            </div>
                        </div>

                        {/* Search Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl max-w-2xl border border-amber-200/50"
                        >
                            <div className="flex items-center gap-3 flex-1 px-2 sm:px-4 min-w-0">
                                {/* <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0" /> */}
                                <input
                                    type="text"
                                    placeholder="Scan QR or Enter code"
                                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-700 placeholder-gray-400 min-w-0"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 sm:px-6 py-2 sm:py-2 bg-gradient-to-tl from-primary to-black text-white text-sm sm:text-base rounded-full shadow-md shadow-black transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                            // onClick={handleFoundPet}
                            >
                                <MapPin className="w-4 h-4" />
                                <span className="hidden sm:inline">Find Now</span>
                                <span className="sm:hidden">Find</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Paw Print */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="hidden md:block h-64 lg:h-140 -mt-10 lg:-mt-30 bg-gradient-to-br from-primary via-primary via-30% to-black"
                        style={{
                            WebkitMaskImage: "url('./images/paw-img.png')",
                            WebkitMaskRepeat: "no-repeat",
                            WebkitMaskSize: "contain",
                            WebkitMaskPosition: "center",
                            maskImage: "url('./images/paw-img.png')",
                            maskRepeat: "no-repeat",
                            maskSize: "contain",
                            maskPosition: "center",
                        }}
                    ></motion.div>
                </motion.div>
            </div>
            <FundingCTA />
        </div>
    );
}