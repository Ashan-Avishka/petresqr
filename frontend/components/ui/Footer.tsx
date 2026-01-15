"use client";

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = async () => {
    if (!email) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Thank you for subscribing! Check your email for confirmation.' 
        });
        setEmail('');
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: typeof data.error === 'string' ? data.error : 'Failed to subscribe. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubscribe();
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
              Join Our Community
            </h3>
            <h2 className="text-3xl font-bold text-white mb-4">
              Protect Them Together!
            </h2>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Subscribe to receive updates on pet safety tips, new products, and exclusive offers for keeping your furry friends safe.
            </p>

            {/* Status Message */}
            {submitStatus.message && (
              <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50 text-green-200' 
                  : 'bg-red-500/20 border border-red-500/50 text-red-200'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{submitStatus.message}</span>
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                {mounted ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                  />
                ) : (
                  <div className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border border-slate-200 h-12" />
                )}
              </div>
              {mounted ? (
                <button
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-br shadow-primary from-primary to-black text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Subscribe'}
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
              {['Worldwide Shipping', 'Premium Quality Tags', 'Secure Payments', 'Best Offers'].map((item) => (
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
            <h3 className="text-lg font-bold text-primary mb-4">Quick Links</h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-3">
              {['Home', 'Get Your QR Tag', 'Pet Gallery', 'Contact Us', 'Login', 'My Account'].map((item) => (
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
          <p className="text-center text-sm text-slate-400">
            © 2025 PetResQR. All Rights Reserved. Keeping Your Pets Safe.
          </p>
        </div>
      </div>
    </footer>
  );
}