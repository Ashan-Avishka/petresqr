"use client";

import React, {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import HydrationSafeButton from '../ui/HydrationSafeButton';

export default function FundingCTA() {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 md:pb-60 pb-20 px-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat -mt-50"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg')",
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/50 to-slate-900/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Lorem ipsum dolor sit,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-black">
              consectetur adipiscing
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-row gap-4 justify-center items-center"
          >
            <HydrationSafeButton
              icon={Heart}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 20px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" 
              }}
              className="md:px-8 md:py-4 px-6 py-3 md:text-lg"
            >
              Fund Now
            </HydrationSafeButton>

            <HydrationSafeButton
              icon={Shield}
              variant="secondary"
              className="md:px-8 md:py-4 px-5 py-3 md:text-lg"
            >
              Learn More
            </HydrationSafeButton>
          </motion.div>

          {/* Stats or Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto ${isMobile ? 'hidden' : ''}`}
          >
            {[
              { number: "10K+", label: "Pets Protected" },
              { number: "50K+", label: "Happy Owners" },
              { number: "99%", label: "Success Rate" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-sm font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>


        </motion.div>
      </div>
    </section>
  );
}