"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Tag, Scan, FileText, Phone, Bell } from 'lucide-react';

export default function PetQRSteps() {
  const steps = [
    {
      number: 1,
      title: "Register a QR Code Tag",
      description: "Sign up and create your pet's digital profile",
      icon: ClipboardList,
      color: "from-blue-500 to-blue-600",
      position: "top"
    },
    {
      number: 2,
      title: "Attach the QR Code Tag",
      description: "Securely attach the tag to your pet's collar",
      icon: Tag,
      color: "from-purple-500 to-purple-600",
      position: "bottom"
    },
    {
      number: 3,
      title: "Scan the QR Code",
      description: "Anyone can scan the code with their phone",
      icon: Scan,
      color: "from-green-500 to-green-600",
      position: "top"
    },
    {
      number: 4,
      title: "View Pet Information",
      description: "Instant access to vital pet and owner details",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      position: "bottom"
    },
    {
      number: 5,
      title: "Contact the Owner",
      description: "Direct communication to reunite pet and owner",
      icon: Phone,
      color: "from-red-500 to-red-600",
      position: "top"
    },
    {
      number: 6,
      title: "Receive a Notification",
      description: "The owner receives an email with details",
      icon: Bell,
      color: "from-pink-500 to-pink-600",
      position: "bottom"
    }
  ];

  return (
    <div className="min-h-screen bg-primary-background pt-25 pb-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-30">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
          >
            How It Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg"
          >
            Six simple steps to keep your pet safe
          </motion.p>
        </div>

        <div className="relative px-4">
          {/* Steps Container */}
          <div className="relative grid grid-cols-6 gap-4" style={{ minHeight: '500px' }}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isTop = step.position === "top";

              return (
                <div key={step.number} className="relative flex flex-col items-center">
                  {/* Top Card */}
                  {isTop && (
                    <div className="absolute bottom-full mb-4 flex flex-col items-center" style={{ bottom: 'calc(50% + 24px)' }}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        // whileHover={{ y: -8, scale: 1.05 }}
                        className="bg-primary-background rounded-xl w-[300px] p-4 -mb-1.5 z-1 border-b-3 border-amber-600 "
                        style={{
                          boxShadow: "0 8px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div className="flex items-start">
                          <div className={`aspect-square w-18 mr-4 rounded-lg bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center shadow-md`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-2xl mb-2 leading-tight">
                              {step.title}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                        className="w-3 h-3 rounded-full bg-amber-600"
                      />

                      {/* Connector Line */}
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: index * 0.2 + 0.2, duration: 0.3 }}
                        className="w-0.5 bg-gradient-to-t from-amber-400/20 to-amber-600 origin-bottom mb-4"
                        style={{ height: '100px' }}
                      />

                    </div>
                  )}

                  {/* Timeline and Number Circle - Centered */}
                  <div className="flex items-center justify-center" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%' }}>
                    {/* Timeline Line Segment */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 0.3 }}
                        className="absolute left-1/2 h-1 bg-amber-700 origin-left"
                        style={{ width: 'calc(100% + 16px)' }}
                      />
                    )}

                    {/* Number Circle */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 + 0.4, type: "spring", stiffness: 200 }}
                      className={`relative z-10 w-25 h-25 border-double border-amber-950 rounded-full bg-gradient-to-bl from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-4xl shadow-lg`}
                    >
                      <div className='bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-800 text-white text-shadow-lg rounded-full w-24 h-24 flex items-center justify-center'>
                        {`0${step.number}`}
                      </div>

                    </motion.div>
                  </div>

                  {/* Bottom Card */}
                  {!isTop && (
                    <div className="absolute top-full mt-4 flex flex-col items-center" style={{ top: 'calc(50% + 24px)' }}>
                      {/* Connector Line */}
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: index * 0.2 + 0.2, duration: 0.3 }}
                        className="w-0.5 bg-gradient-to-b from-amber-400/20 to-amber-600 origin-top mt-5"
                        style={{ height: '100px' }}
                      />

                      {/* Dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                        className="w-3 h-3 rounded-full bg-amber-600"
                      />

                      <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className="bg-primary-background rounded-xl w-[300px] p-4 -mt-1.5 border-t-3 border-amber-600"
                        style={{
                          boxShadow: "0 -7px 10px rgba(0,0,0,0.07)",
                        }}
                      >
                        <div className="flex items-start">
                          <div className={`aspect-square w-18 mr-4 rounded-lg bg-gradient-to-br from-secondary to-amber-600 flex items-center justify-center shadow-md`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-2xl mb-2 leading-tight">
                              {step.title}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}