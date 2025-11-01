"use client";

import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = () => {
    if (email) {
      console.log('Subscribing email:', email);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-primary via-black/50 to-black border-t border-primary">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm text-gray-300 mb-3">
              Let's Get Together to
            </h3>
            <h2 className="text-3xl font-bold text-white mb-4">
              Protect Them !
            </h2>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                {mounted ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email Address"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border border-slate-200 h-12" />
                )}
              </div>
              {mounted ? (
                <button
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-gradient-to-br shadow-primary from-primary to-black text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Subscribe
                </button>
              ) : (
                <div className="px-6 py-3 bg-gradient-to-br shadow-primary from-primary to-black text-white font-bold rounded-lg">
                  Subscribe
                </div>
              )}
            </div>
          </div>

          {/* Product Section */}
          <div className='md:pl-10'>
            <h3 className="text-lg font-bold text-primary mb-4">Product</h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-3">
              {['Pet Tag 01', 'Pet Tag 02', 'Pet Tag 03', 'Pet Tag 04'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-300 text-sm hover:text-primary hover:translate-x-1 inline-block transition-all"
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li className="col-span-2 md:col-span-1">
                <a
                  href="#"
                  className="text-gray-300 font-semibold text-sm hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  View All
                </a>
              </li>
            </ul>
          </div>

          {/* Our Services Section */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Our Services</h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-3">
              {['Worldwide Shipping', 'Best Quality', 'Secure Payments', 'Best Offers'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-300 text-sm hover:text-primary hover:translate-x-1 inline-block transition-all"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Pages</h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-3">
              {['Home', 'Get Your QR Tag', 'Pet Gallery', 'Contact us', 'Login', 'Account'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-300 text-sm hover:text-primary hover:translate-x-1 inline-block transition-all"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-primary bg-gradient-to-l from-black via-primary to-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-slate-600">
            © 2025 All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}