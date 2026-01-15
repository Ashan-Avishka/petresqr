"use client";

import { useState, createContext, useContext } from 'react';
import "./globals.css";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import AuthModal from "../../components/Models/AuthModel";
import { AuthProvider } from '../../contexts/AuthContext';
import { UserProvider } from '../../contexts/UserContext';
import { CartProvider } from '../../contexts/CartContext';

// Create context for auth modal
const AuthModalContext = createContext({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Wrap the app in AuthProvider */}
        <AuthProvider>
          <UserProvider>
            <CartProvider>
          <AuthModalContext.Provider
            value={{
              openAuthModal: () => setIsAuthModalOpen(true),
              closeAuthModal: () => setIsAuthModalOpen(false),
            }}
          >
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />

            {/* Single AuthModal instance for entire app */}
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </AuthModalContext.Provider>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
