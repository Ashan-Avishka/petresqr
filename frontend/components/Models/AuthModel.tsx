"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [signUpStep, setSignUpStep] = useState(1);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        // Sign In
        email: '',
        password: '',
        // Step 1
        firstName: '',
        lastName: '',
        mobile: '',
        countryCode: '+1',
        // Step 2
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        // Step 3
        username: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        if (!isSignIn && signUpStep < 3) {
            setSignUpStep(signUpStep + 1);
        } else {
            console.log('Form submitted:', formData);
            if (!isSignIn) {
                // Reset to step 1 after successful signup
                setSignUpStep(1);
            }
        }
    };

    const handleBack = () => {
        if (signUpStep > 1) {
            setSignUpStep(signUpStep - 1);
        }
    };

    const switchMode = () => {
        setIsSignIn(!isSignIn);
        setSignUpStep(1);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            mobile: '',
            countryCode: '+1',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            username: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    const countryCodes = [
        { code: '+1', country: 'US' },
        { code: '+44', country: 'UK' },
        { code: '+91', country: 'IN' },
        { code: '+94', country: 'LK' },
        { code: '+61', country: 'AU' },
        { code: '+81', country: 'JP' },
    ];

    const getStepTitle = () => {
        if (isSignIn) return 'Welcome back!';
        switch (signUpStep) {
            case 1:
                return 'Create Account';
            case 2:
                return 'Your Address';
            case 3:
                return 'Account Details';
            default:
                return 'Create Account';
        }
    };

    const getStepSubtitle = () => {
        if (isSignIn) return 'Enter your credentials to access your account';
        switch (signUpStep) {
            case 1:
                return 'Let\'s start with your basic information';
            case 2:
                return 'Where can we reach you?';
            case 3:
                return 'Set up your login credentials';
            default:
                return 'Fill in your details to get started';
        }
    };

    const getImageForState = () => {
        if (isSignIn) {
            return "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=1000&fit=crop";
        }

        switch (signUpStep) {
            case 1:
                return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=1000&fit=crop";
            case 2:
                return "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800&h=1000&fit=crop";
            case 3:
                return "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=1000&fit=crop";
            default:
                return "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=1000&fit=crop";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="bg-white h-160 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex"
                            style={{ maxHeight: '90vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Progress Indicator for Sign Up */}
                                {!isSignIn && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            {[1, 2, 3].map((step) => (
                                                <React.Fragment key={step}>
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${signUpStep >= step
                                                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                                                                    : 'bg-gray-200 text-gray-500'
                                                                }`}
                                                        >
                                                            {step}
                                                        </div>
                                                        <span className="text-xs mt-1 text-gray-600">
                                                            {step === 1 ? 'Info' : step === 2 ? 'Address' : 'Account'}
                                                        </span>
                                                    </div>
                                                    {step < 3 && (
                                                        <div
                                                            className={`flex-1 h-1 mx-2 rounded transition-colors -mt-4 ${signUpStep > step ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gray-200'
                                                                }`}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        {getStepTitle()}
                                    </h2>
                                    <p className="text-gray-600">
                                        {getStepSubtitle()}
                                    </p>
                                </div>

                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex-1 space-y-4 pr-2">
                                        {/* Sign In Form */}
                                        {isSignIn && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your email"
                                                        className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Password
                                                        </label>
                                                        <button type="button" className="text-xs text-amber-600 hover:underline">
                                                            forgot password?
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="••••••"
                                                        className="w-full px-4 py-2 text-sm text-black tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="remember"
                                                        checked={rememberMe}
                                                        onChange={(e) => setRememberMe(e.target.checked)}
                                                        className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                                                    />
                                                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                                        Remember for 60 days
                                                    </label>
                                                </div>
                                            </>
                                        )}

                                        {/* Sign Up Step 1 - Personal Info */}
                                        {!isSignIn && signUpStep === 1 && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            First name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            placeholder="John"
                                                            className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Last name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            placeholder="Doe"
                                                            className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Mobile number
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <select
                                                            name="countryCode"
                                                            value={formData.countryCode}
                                                            onChange={handleInputChange}
                                                            className="px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        >
                                                            {countryCodes.map((item) => (
                                                                <option key={item.code} value={item.code}>
                                                                    {item.country} {item.code}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="tel"
                                                            name="mobile"
                                                            value={formData.mobile}
                                                            onChange={handleInputChange}
                                                            placeholder="123 456 7890"
                                                            className="flex-1 px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Sign Up Step 2 - Address */}
                                        {!isSignIn && signUpStep === 2 && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Street Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="street"
                                                        value={formData.street}
                                                        onChange={handleInputChange}
                                                        placeholder="123 Main Street"
                                                        className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                            placeholder="New York"
                                                            className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            State/Province
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={handleInputChange}
                                                            placeholder="NY"
                                                            className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            ZIP/Postal Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="zipCode"
                                                            value={formData.zipCode}
                                                            onChange={handleInputChange}
                                                            placeholder="10001"
                                                            className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Country
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={handleInputChange}
                                                            placeholder="United States"
                                                            className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Sign Up Step 3 - Account Credentials */}
                                        {!isSignIn && signUpStep === 3 && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleInputChange}
                                                        placeholder="Choose a username"
                                                        className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Create a password"
                                                        className="w-full px-4 py-2 text-sm text-black tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Confirm your password"
                                                        className="w-full px-4 py-2 text-sm text-black tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Navigation Buttons */}
                                        <div className="flex gap-4 pt-4">
                                            {!isSignIn && signUpStep > 1 && (
                                                <Button
                                                    variant="secondary"
                                                    size="md"
                                                    onClick={handleBack}
                                                    className="flex-1 w-41"
                                                >
                                                    Back
                                                </Button>
                                            )}
                                            <Button
                                                variant="primary"
                                                size="md"
                                                onClick={handleSubmit}
                                                className={!isSignIn && signUpStep > 1 ? 'flex-1 w-41' : 'w-41'}
                                            >
                                                {!isSignIn && signUpStep < 3 ? 'Next' : isSignIn ? 'Login' : 'Sign Up'}
                                            </Button>
                                        </div>

                                        {/* Social Login - Only on Sign In */}
                                        {isSignIn && (
                                            <>
                                                <div className="relative my-6">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-300"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-2 bg-white text-gray-500">Or</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-700">Google</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#CBCBCB">
                                                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-700">Apple</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Toggle Sign In/Sign Up - Always at Bottom */}
                                    <div className="pt-4 mt-4 border-t border-gray-100 flex-shrink-0">
                                        <span className="text-sm text-gray-600">
                                            {isSignIn ? "Don't have an account? " : "Already have an account? "}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={switchMode}
                                            className="ml-2 text-sm text-amber-600 font-semibold hover:underline"
                                        >
                                            {isSignIn ? 'Sign Up' : 'Sign In'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                                <AnimatePresence mode="sync">
                                    <motion.div
                                        key={isSignIn ? 'signin' : `signup-${signUpStep}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: 'easeInOut',
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src={getImageForState()}
                                            alt="Happy pets"
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;