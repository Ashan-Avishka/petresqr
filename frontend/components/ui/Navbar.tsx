"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from './Button';
import AuthModal from '../Models/AuthModel';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  links?: NavLink[];
  logo?: React.ReactNode;
  showLogin?: boolean;
  onLoginClick?: () => void;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  links = [
    { label: 'QR TAGS', href: '/shop' },
    { label: 'FOUND A PET', href: '/found-pet' },
    { label: 'GALLERY', href: '/pet-gallery' },
    { label: 'CONTACT', href: '/contact' },
  ],
  logo,
  showLogin = true,
  onLoginClick,
  backgroundColor = 'bg-white/80',
  textColor = 'text-gray-900',
  className = '',
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const defaultLogo = (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-xl">Y</span>
      </div>
    </div>
  );

  return (
    <>
      <motion.nav
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] }}
        className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        style={{ transformOrigin: 'center' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${backgroundColor} backdrop-blur-md rounded-full shadow-lg px-6 py-3 flex items-center justify-between`}
          >
            <Link href="/" className="flex items-center">
              {logo || defaultLogo}
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {links.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="relative group"
                >
                  <Link
                    href={link.href}
                    className={`${textColor} font-medium text-sm transition-colors duration-300 group-hover:text-amber-600`}
                  >
                    {link.label}
                  </Link>
                  <motion.div
                    className="absolute -bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500"
                    initial={{ width: 0, x: '-50%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.div>
              ))}
            </div>

            {showLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleLoginClick}
                  className="flex items-center gap-2"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  Login
                </Button>
              </motion.div>
            )}

            <button className="md:hidden flex flex-col gap-1.5">
              <span className="w-6 h-0.5 bg-gray-900 rounded"></span>
              <span className="w-6 h-0.5 bg-gray-900 rounded"></span>
              <span className="w-6 h-0.5 bg-gray-900 rounded"></span>
            </button>
          </motion.div>
        </div>
      </motion.nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;