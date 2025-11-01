"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X } from 'lucide-react';
import { useAuthModal } from '../../src/app/layout';

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
    { label: 'QR TAGS', href: '/tags' },
    { label: 'FOUND A PET', href: '/found-pet' },
    { label: 'GALLERY', href: '/pet-gallery' },
    { label: 'CONTACT', href: '/contact' },
  ],
  logo,
  showLogin = true,
  onLoginClick,
  backgroundColor = 'bg-white/20',
  textColor = 'text-white',
  className = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openAuthModal } = useAuthModal();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      openAuthModal();
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
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${backgroundColor} backdrop-blur-md shadow-primary rounded-full shadow-md px-4 sm:px-6 py-3 flex items-center justify-between`}
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
                    className={`${textColor} font-medium text-sm transition-colors duration-300 group-hover:text-black relative`}
                  >
                    {link.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{ transformOrigin: 'center' }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {showLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="hidden md:block"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-2 bg-gradient-to-tl from-primary to-black text-white text-lg rounded-full shadow-md shadow-black transition-all flex items-center gap-2"
                  onClick={handleLoginClick}
                >
                  <User className="w-5 h-5" />
                  Login
                </motion.button>
              </motion.div>
            )}

            <button 
              className="md:hidden flex flex-col gap-1.5 z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${textColor}`} />
              ) : (
                <>
                  <span className={`w-6 h-0.5 ${textColor} bg-current rounded`}></span>
                  <span className={`w-6 h-0.5 ${textColor} bg-current rounded`}></span>
                  <span className={`w-6 h-0.5 ${textColor} bg-current rounded`}></span>
                </>
              )}
            </button>
          </motion.div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden mt-4"
              >
                <motion.div 
                  className={`${backgroundColor} backdrop-blur-md rounded-3xl shadow-lg p-4 sm:p-6`}
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  exit={{ y: -20 }}
                >
                  <div className="flex flex-col gap-4">
                    {links.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          className={`${textColor} font-medium text-base block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                    
                    {showLogin && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: links.length * 0.1 }}
                        className="pt-4 border-t border-white/20"
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="w-full px-8 py-3 bg-gradient-to-tl from-primary to-black text-white text-base rounded-full shadow-md shadow-black transition-all flex items-center justify-center gap-2"
                          onClick={() => {
                            handleLoginClick();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <User className="w-5 h-5" />
                          Login
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;