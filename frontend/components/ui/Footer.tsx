"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email) {
      console.log('Subscribing email:', email);
      setEmail('');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-200">
      {/* Main Footer Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Newsletter Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
              Let's Get Together to
            </h3>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Protect Them !
            </h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
            </p>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email Address"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubscribe}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>

          {/* Product Section */}
          <motion.div variants={itemVariants} className='pl-10'>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Product</h3>
            <ul className="space-y-3">
              {['Pet Tag 01', 'Pet Tag 02', 'Pet Tag 03', 'Pet Tag 04'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-600 text-sm hover:text-slate-900 hover:translate-x-1 inline-block transition-all"
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="text-slate-900 font-semibold text-sm hover:text-amber-600 hover:translate-x-1 inline-block transition-all"
                >
                  View All
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Our Services Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Our Services</h3>
            <ul className="space-y-3">
              {['Worldwide Shipping', 'Best Quality', 'Secure Payments', 'Best Offers'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-600 text-sm hover:text-slate-900 hover:translate-x-1 inline-block transition-all"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pages Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Pages</h3>
            <ul className="space-y-3">
              {['Home', 'Get Your QR Tag', 'Pet Gallery', 'Contact us', 'Login', 'Account'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-600 text-sm hover:text-slate-900 hover:translate-x-1 inline-block transition-all"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Copyright Section */}
      <div className="border-t border-amber-200 bg-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-slate-600">
            © 2025 All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}