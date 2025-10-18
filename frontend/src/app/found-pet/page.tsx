"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, Camera, Heart, AlertCircle } from 'lucide-react';
import PetProfile from '../../../components/FoundPet/PetProfile';
import HeroHeader from '../../../components/ui/PageHero';
import FundingCTA from '../../../components/home/FundingSection';
import Button from '../../../components/ui/Button';

export default function LostPetPage() {
    const [activeTab, setActiveTab] = useState('Bio');

    const petData = {
        name: "Lorem Ipsum",
        breed: "Lorem Ipsum",
        color: "Lorem Ipsum",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    };

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

    return (
        <>
            {/* Hero Header */}
            <HeroHeader
                backgroundImage="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
                title="Lorem ipsum dolor"
                subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            ></HeroHeader>

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Instructions Section */}
                    <div className="mb-8 mt-20">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Pet Image */}
                            <div className="relative col-span-2">
                                <div className="overflow-hidden ">
                                    <img
                                        src="./images/instructions-img.jpg"
                                        alt="Lost pet"
                                        className="w-full h-160 object-center object-cover"
                                    />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="flex flex-col justify-center -ml-60">
                                <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl'>
                                    <h1 className="text-4xl font-bold text-slate-800 mb-2">
                                        Looks like a furry friend needs help getting home!
                                    </h1>
                                    <p className="text-slate-600 text-sm mb-6">
                                        You've just met your new furry hero by scanning this pet with their family.
                                    </p>

                                    {/* Steps */}
                                    <div className="space-y-4 mt-10">
                                        {steps.map((step) => (
                                            <div key={step.number} className="flex gap-4 mt-6">
                                                <div className="flex-shrink-0 w-15 h-15 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700 text-2xl">
                                                    {step.number}
                                                </div>
                                                <p className="text-slate-600 text-xl pt-2">{step.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="grid md:grid-cols-2 h-80 mb-8 bg-gradient-to-r from-amber-300 to-transparent rounded-3xl shadow-xl mt-30 mb-20">
                        {/* QR Card */}
                        <div className="pl-8 flex flex-col justify-center -mt-30">
                            <div className="flex items-center gap-8 mb-12">
                                <div className="bg-white p-2 rounded-xl">
                                    <QrCode className="w-22 h-22 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-5xl leading-tight">Click here to scan <br /> the QR code</h3>
                                    <p className="text-slate-700 text-sm"></p>
                                </div>
                            </div>

                            {/* Search Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl max-w-2xl border border-amber-200/50"
                            >
                                <div className="flex items-center gap-3 flex-1 px-4">
                                    <svg
                                        className="w-6 h-6 text-amber-800"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                                        <path d="M7 7h4v4H7z" strokeWidth="2" />
                                        <path d="M7 13h.01M13 7h.01M13 13h.01M7 17h.01M13 17h.01M17 7h.01M17 13h.01M17 17h.01" strokeWidth="2" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Scan the QR or Enter the code"
                                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    size="md"
                                // onClick={handleFoundPet}
                                >
                                    FOUND A PET
                                </Button>
                            </motion.div>
                        </div>

                        {/* Paw Print */}
                        <div className="">
                            <img src="./images/paw-img.png" className='h-140 -mt-30' alt="" />
                        </div>
                    </div>

                    {/* Pet Profile Section */}
                    {/* <PetProfile petData={petData} /> */}
                </div>
            </div>
            <FundingCTA />
        </>
    );
}