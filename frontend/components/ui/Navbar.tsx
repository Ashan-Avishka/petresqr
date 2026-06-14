"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, ShoppingCart, LogOut } from 'lucide-react';
import { useAuthModal } from '../../src/app/layout';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

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
    { label: 'SHOP', href: '/shop' },
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
  const { isAuthenticated, user, logout } = useAuthContext();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const cartCount = itemCount;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    else openAuthModal();
  };

  const handleLogout = async () => {
    await logout();
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
            <Link href="/" className="flex items-center -mt-3 -mb-3">
              {logo || defaultLogo}
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="relative group"
                  >
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors duration-300 relative block pb-1  ${active ? 'font-bold text-black shadow-primary' : 'font-normal'
                        }`}
                      style={active ? { textShadow: '0 0 6px #FABC3F, 0 0 12px #FABC3F, 0 0 20px #FABC3F' } : {}}
                    >
                      {link.label}

                      {/* Hover underline */}
                      {!active && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
                      )}

                      {/* Active glowing underline */}
                      {active && (
                        <motion.span
                          layoutId="activeNavIndicator"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                          style={{
                            background: 'black',
                            boxShadow: '0 0 4px 1px var(--color-primary, #f59e0b), 0 0 12px 2px var(--color-primary, #f59e0b)',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Auth + Cart */}
            {showLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="hidden md:flex items-center gap-4"
              >
                {isAuthenticated ? (
                  <>
                    <Link href="/cart">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
                      >
                        <ShoppingCart className={`w-6 h-6 ${textColor}`} />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tl from-primary  to-black text-white text-xs rounded-full flex items-center justify-center">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </motion.button>
                    </Link>

                    <Link href="/dashboard">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tl from-primary to-black text-white rounded-full shadow-md shadow-black transition-all"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">Dashboard</span>
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      title="Logout"
                    >
                      <LogOut className={`w-5 h-5 ${textColor}`} />
                    </motion.button>
                  </>
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

            {/* Mobile Hamburger */}
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
                    {links.map((link, index) => {
                      const active = isActive(link.href);
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={link.href}
                            className={`font-medium text-base block py-2 px-4 rounded-lg transition-colors duration-300 relative group ${active
                                ? 'text-white bg-white/10'
                                : `${textColor} hover:bg-white/10`
                              }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.label}

                            {/* Active left bar indicator for mobile */}
                            {active && (
                              <motion.span
                                layoutId="mobileActiveIndicator"
                                className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                                style={{
                                  background: 'var(--color-primary, #f59e0b)',
                                  boxShadow: '0 0 6px 1px var(--color-primary, #f59e0b)',
                                }}
                              />
                            )}

                            {/* Hover underline for non-active */}
                            {!active && (
                              <motion.span
                                className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformOrigin: 'center' }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}

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
                              className={`${textColor} font-medium text-base py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300 flex items-center gap-2 relative`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-tl from-primary  to-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                  </span>
                                )}
                              </div>
                              Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>

                            <Link
                              href="/dashboard"
                              className={`${textColor} font-medium text-base block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-300`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Dashboard
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