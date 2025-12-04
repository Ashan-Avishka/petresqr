"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Tag, Scan, FileText, Phone, Bell } from 'lucide-react';
import Button from '../ui/Button';

// Hook to detect mobile screen size
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Hook to detect when section is in view
function useInView(ref, threshold = 0.3) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, threshold]);

  return isInView;
}

export default function PetQRSteps() {
  const isMobile = useIsMobile(768);
  const [activeStep, setActiveStep] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const stepRefs = useRef([]);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(sectionRef, 0.3);

  // Play video when section comes into view
  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, [isInView]);

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

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const { top, bottom } = ref.getBoundingClientRect();
          const elementPosition = top + window.scrollY;
          
          if (scrollPosition >= elementPosition && scrollPosition <= elementPosition + (bottom - top)) {
            setActiveStep(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Mobile View - Vertical Timeline
  if (isMobile) {
    const visibleSteps = showAllSteps ? steps : steps.slice(0, 3);

    return (
      <div ref={sectionRef} className="min-h-screen bg-black py-16 px-4 relative overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="./videos/pet-bg.mp4" type="video/mp4" />
          {/* <source src="/videos/pet-background.webm" type="video/webm" /> */}
        </video>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              How It Works
            </h1>
            <p className="text-gray-400 text-base">
              Six simple steps to keep your pet safe
            </p>
          </div>

          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent" />

            {visibleSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;

              return (
                <div 
                  key={step.number}
                  ref={(el) => (stepRefs.current[index] = el)}
                  className="relative mb-12 last:mb-0"
                  style={{
                    opacity: isActive ? 1 : 0.4,
                    transform: isActive ? 'scale(1)' : 'scale(0.92)',
                    transition: 'all 0.5s ease',
                    minHeight: '120px'
                  }}
                >
                  {/* Number Circle */}
                  <div className="absolute left-0 w-16 h-16 rounded-full bg-gradient-to-bl from-primary via-black via-80% to-black flex items-center justify-center border-2 border-primary z-10"
                    style={{
                      borderWidth: isActive ? '3px' : '2px',
                      transition: 'border-width 0.3s ease'
                    }}
                  >
                    <div className="bg-gradient-to-tr from-primary via-black via-50% to-black text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold">
                      0{step.number}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="ml-24 bg-gray-900 backdrop-blur-xl rounded-xl p-5 border border-gray-800 shadow-xl"
                    style={{
                      borderColor: isActive ? '#f59e0b' : '#1f2937',
                      transition: 'border-color 0.3s ease'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-black flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg font-semibold mb-1.5 leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Read More / Show Less Button */}
          {!showAllSteps && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mt-10"
                >
                    <Button
                        onClick={() => setShowAllSteps(true)}
                        variant="primary"
                        size="md"
                    >
                        Show More
                    </Button>
                </motion.div>
          )}

          {showAllSteps && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center md:mt-20 mt-10"
                >
                    <Button
                        onClick={() => setShowAllSteps(false)}
                        variant="primary"
                        size="md"
                    >
                        Show Less
                    </Button>
                </motion.div>
          )}

          {/* Add spacing at the end so last item can be scrolled to center */}
          <div style={{ height: '3vh' }} />
        </div>
      </div>
    );
  }

  // Desktop View - Original Horizontal Timeline
  return (
    <div ref={sectionRef} className="min-h-screen overflow-hidden bg-black pt-25 pb-50 px-4 relative">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="./videos/pet-bg.mp4" type="video/mp4" />
        <source src="/videos/pet-background.webm" type="video/webm" />
      </video>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-30">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}
          >
            How It Works
          </h1>
          <p className="text-gray-400 text-lg"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s'
            }}
          >
            Six simple steps to keep your pet safe
          </p>
        </div>

        <div className="relative px-4">
          <div className="relative grid grid-cols-6 gap-4" style={{ minHeight: '500px' }}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isTop = step.position === "top";

              return (
                <div key={step.number} className="relative flex flex-col items-center">
                  {/* Top Card */}
                  {isTop && (
                    <div className="absolute bottom-full mb-4 flex flex-col items-center" style={{ bottom: 'calc(50% + 24px)' }}>
                      <div
                        className="bg-gray-600 backdrop-blur-3xl rounded-xl w-[300px] p-4 -mb-1.5 z-1"
                        style={{
                          boxShadow: "0 8px 12px rgba(0,0,0,0.1)",
                          borderBottom: '3px solid #f59e0b',
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                          transition: `opacity 0.5s ease ${index * 0.2}s, transform 0.5s ease ${index * 0.2}s`
                        }}
                      >
                        <div className="flex items-start">
                          <div className="aspect-square w-18 mr-4 rounded-lg bg-gradient-to-br from-primary to-black flex items-center justify-center shadow-md"
                            style={{
                              boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white text-2xl mb-2 leading-tight">
                              {step.title}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="w-3 h-3 rounded-full bg-primary"
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'scale(1)' : 'scale(0)',
                          transition: `opacity 0.3s ease ${index * 0.2 + 0.3}s, transform 0.3s ease ${index * 0.2 + 0.3}s`
                        }}
                      />

                      <div
                        className="w-0.5 mb-4"
                        style={{ 
                          height: '100px',
                          background: 'linear-gradient(to top, rgba(245, 158, 11, 0.2), #f59e0b)',
                          transformOrigin: 'bottom',
                          transform: isInView ? 'scaleY(1)' : 'scaleY(0)',
                          transition: `transform 0.3s ease ${index * 0.2 + 0.2}s`
                        }}
                      />
                    </div>
                  )}

                  {/* Timeline and Number Circle */}
                  <div className="flex items-center justify-center" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%' }}>
                    {index < steps.length - 1 && (
                      <div
                        className="absolute left-1/2 h-1 bg-primary"
                        style={{ 
                          width: 'calc(100% + 16px)',
                          transformOrigin: 'left',
                          transform: isInView ? 'scaleX(1)' : 'scaleX(0)',
                          transition: `transform 0.3s ease ${index * 0.2 + 0.5}s`
                        }}
                      />
                    )}

                    <div
                      className="relative z-10 w-25 h-25 border-double border-amber-950 rounded-full bg-gradient-to-bl from-primary via-black via-80% to-black flex items-center justify-center text-white font-bold text-4xl shadow-lg"
                      style={{
                        opacity: isInView ? 1 : 0,
                        transform: isInView ? 'scale(1)' : 'scale(0)',
                        transition: `opacity 0.3s ease ${index * 0.2 + 0.4}s, transform 0.3s ease ${index * 0.2 + 0.4}s`
                      }}
                    >
                      <div className='bg-gradient-to-tr from-primary via-black via-50% to-black text-white rounded-full w-24 h-24 flex items-center justify-center'>
                        0{step.number}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card */}
                  {!isTop && (
                    <div className="absolute top-full mt-4 flex flex-col items-center" style={{ top: 'calc(50% + 24px)' }}>
                      <div
                        className="w-0.5 mt-5"
                        style={{ 
                          height: '100px',
                          background: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.2), #f59e0b)',
                          transformOrigin: 'top',
                          transform: isInView ? 'scaleY(1)' : 'scaleY(0)',
                          transition: `transform 0.3s ease ${index * 0.2 + 0.2}s`
                        }}
                      />

                      <div
                        className="w-3 h-3 rounded-full bg-primary"
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'scale(1)' : 'scale(0)',
                          transition: `opacity 0.3s ease ${index * 0.2 + 0.3}s, transform 0.3s ease ${index * 0.2 + 0.3}s`
                        }}
                      />

                      <div
                        className="bg-gray-600 backdrop-blur-3xl rounded-xl w-[300px] p-4 -mt-1.5"
                        style={{
                          boxShadow: "0 -7px 10px rgba(0,0,0,0.07)",
                          borderTop: '3px solid #f59e0b',
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'translateY(0)' : 'translateY(-20px)',
                          transition: `opacity 0.5s ease ${index * 0.2}s, transform 0.5s ease ${index * 0.2}s`
                        }}
                      >
                        <div className="flex items-start">
                          <div className="aspect-square w-18 mr-4 rounded-lg bg-gradient-to-br from-primary to-black flex items-center justify-center shadow-md"
                            style={{
                              boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white text-2xl mb-2 leading-tight">
                              {step.title}
                            </h3>
                            <p className="text-gray-200 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
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