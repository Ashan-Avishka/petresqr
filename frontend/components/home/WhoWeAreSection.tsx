"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, UsersRound, BadgeCheck, Clock, Star, Dog } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";

interface StatItemProps {
  icon: React.ReactNode;
  number: string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, number, label, delay }) => {
  const [displayNumber, setDisplayNumber] = useState('0');

  useEffect(() => {
    const numericValue = parseInt(number.replace(/[^0-9]/g, ''));
    const suffix = number.replace(/[0-9]/g, '');

    if (isNaN(numericValue)) {
      setDisplayNumber(number);
      return;
    }

    let currentNum = 0;
    const increment = Math.ceil(numericValue / 50);

    const interval = setInterval(() => {
      currentNum += increment;
      if (currentNum >= numericValue) {
        setDisplayNumber(numericValue + suffix);
        clearInterval(interval);
      } else {
        setDisplayNumber(currentNum + suffix);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [number]);

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
        {displayNumber}
      </motion.div>
      <p className="text-xs md:text-sm font-medium text-gray-400 text-center -mt-2">
        {label}
      </p>
    </motion.div>
  );
};

const WhoWeAreSection: React.FC = () => {
  const isMobile = useIsMobile();

  const stats = [
    {
      icon: <Dog className="w-10 h-10 text-white" strokeWidth={1} />,
      number: "50,000+",
      label: "Protected Pets",
    },
    {
      icon: <UsersRound className="w-11 h-11 text-white" strokeWidth={1} />,
      number: "25,000+",
      label: "Happy Families",
    },
    {
      icon: <BadgeCheck className="w-12 h-12 text-white" strokeWidth={1} />,
      number: "98%",
      label: "Success Rate",
    },
    {
      icon: <Clock className="w-12 h-12 text-white" strokeWidth={1} />,
      number: "24/7",
      label: "Support Available",
    },
    {
      icon: <Star className="w-12 h-12 text-white" strokeWidth={1} />,
      number: "4.9★",
      label: "Average Rating",
    },
  ];

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
            At <span className="text-primary font-bold">Petresqr</span>, we are dedicated to helping pets find their way back
            home safely and quickly. Using smart QR code technology, we make it
            easy for anyone to instantly access a pet’s important details and
            contact the owner in just one scan. Our platform is designed to be
            simple, reliable, and accessible to everyone, ensuring that lost
            pets can be reunited with their families without delay. At Petresqr,
            we believe every pet deserves protection—and every owner deserves
            peace of mind.
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
