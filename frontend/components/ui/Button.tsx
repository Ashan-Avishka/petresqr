import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  animated?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  animated = true,
}) => {
  const baseStyles = 'font-medium rounded-full transition-all duration-300 focus:outline-none ';
  
  const variants = {
    primary: 'bg-gradient-to-br from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 border-none text-white shadow-xl',
    secondary: 'ring-amber-600 ring-1 text-amber-600',
    outline: 'bg-transparent border-2 border-current hover:bg-white/10 focus:ring-white/50',
    dark: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700 shadow-2xl',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;
  
  const ButtonContent = () => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
  
  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1.05 : 1 }}
      >
        <ButtonContent />
      </motion.div>
    );
  }
  
  return <ButtonContent />;
};

export default Button;