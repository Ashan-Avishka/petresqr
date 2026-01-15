"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, ShoppingCart, LogOut } from 'lucide-react';
import { useAuthModal } from '../../src/app/layout';
import { useAuthContext } from '../../contexts/AuthContext';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { openAuthModal } = useAuthModal();
  const { isAuthenticated, user, logout } = useAuthContext();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      openAuthModal();
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
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
                    className={`${textColor} font-medium text-sm transition-colors duration-300 group-hover:font-bold group-hover:text-shadow-black relative block pb-1`}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
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
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <Link href="/cart">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
                      >
                        <ShoppingCart className={`w-6 h-6 ${textColor}`} />
                      </motion.button>
                    </Link>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tl from-primary to-black text-white rounded-full shadow-md shadow-black transition-all"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">{user?.name || 'Account'}</span>
                      </motion.button>

                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                          >
                            <Link
                              href="/profile"
                              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors relative group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Profile
                              <motion.span
                                className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                              />
                            </Link>
                            <Link
                              href="/orders"
                              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors relative group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Orders
                              <motion.span
                                className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                              />
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2 relative group"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                              <motion.span
                                className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-red-400 via-red-500 to-red-400"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                              />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(251, 191, 36, 0.8), 0 20px 40px rgba(0, 0, 0, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-2 bg-gradient-to-tl from-primary to-black text-white text-lg rounded-full shadow-md shadow-black transition-all flex items-center gap-2"
                    onClick={handleLoginClick}
                  >
                    <User className="w-5 h-5" />
                    Login
                  </motion.button>
                )}
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
                          className={`${textColor} font-medium text-base block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300 relative group`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                          <motion.span
                            className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{ transformOrigin: 'center' }}
                          />
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
                        {isAuthenticated ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 px-4 py-2">
                              <User className={`w-5 h-5 ${textColor}`} />
                              <span className={`${textColor} font-medium`}>{user?.name || 'Account'}</span>
                            </div>
                            <Link
                              href="/cart"
                              className={`${textColor} font-medium text-base block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300 flex items-center gap-2 relative group`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Cart
                              <motion.span
                                className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                              />
                            </Link>
                            <Link
                              href="/profile"
                              className={`${textColor} font-medium text-base block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300 relative group`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              My Profile
                              <motion.span
                                className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                              />
                            </Link>
                            <Link
                              href="/orders"
                              className={`${textColor} font-medium text-base block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300 relative group`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              My Orders
                              <motion.span
                                className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'left' }}
                              />
                            </Link>
                            <button
                              onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 bg-red-600 text-white rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                            >
                              <LogOut className="w-5 h-5" />
                              Logout
                            </button>
                          </div>
                        ) : (
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
                        )}
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