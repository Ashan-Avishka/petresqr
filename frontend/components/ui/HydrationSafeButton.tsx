"use client";

import React, { useEffect, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HydrationSafeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  whileHover?: MotionProps['whileHover'];
  whileTap?: MotionProps['whileTap'];
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function HydrationSafeButton({
  children,
  onClick,
  className = '',
  icon: Icon,
  whileHover = { scale: 1.05 },
  whileTap = { scale: 0.95 },
  variant = 'primary',
}: HydrationSafeButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-br from-primary to-black shadow-primary text-white font-bold',
    secondary: 'bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold hover:bg-white/20',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const baseClasses = `px-8 py-4 rounded-full shadow-md transition-all flex items-center gap-2 ${variantStyles[variant]} ${className}`;

  // Render static placeholder during SSR
  if (!mounted) {
    return (
      <div className={baseClasses}>
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </div>
    );
  }

  // Render interactive button after hydration
  return (
    <motion.button
      whileHover={whileHover}
      whileTap={whileTap}
      className={baseClasses}
      onClick={onClick}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
}