"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { authAPI } from '../../api';
import type { User } from '../../api/types';
import { signInWithEmail, registerWithEmail, signInWithGoogle } from '../../config/firebase-client';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess?: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
    const router = useRouter();
    const [isSignIn, setIsSignIn] = useState(true);
    const [signUpStep, setSignUpStep] = useState(1);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(null);
    };

    const validateStep = (): boolean => {
        if (isSignIn) {
            if (!formData.email || !formData.password) {
                setError('Please fill in all fields');
                return false;
            }
            return true;
        }

        switch (signUpStep) {
            case 1:
                if (!formData.firstName || !formData.lastName || !formData.mobile) {
                    setError('Please fill in all required fields');
                    return false;
                }
                return true;
            case 2:
                if (!formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
                    setError('Please fill in all address fields');
                    return false;
                }
                return true;
            case 3:
                if (!formData.username || !formData.newPassword || !formData.confirmPassword) {
                    setError('Please fill in all fields');
                    return false;
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (formData.newPassword.length < 6) {
                    setError('Password must be at least 6 characters');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const firebaseToken = await signInWithEmail(formData.email, formData.password);
            const response = await authAPI.loginEmail({
                email: formData.email,
                firebaseToken: firebaseToken,
            });

            if (response.success && response.data) {
                console.log('Login successful:', response.data);
                onAuthSuccess?.(response.data.user);
                onClose();
                
                // Redirect to profile page
                router.push('/profile');
            } else {
                setError(response.error?.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);

        try {
            const fullPhone = `${formData.countryCode}${formData.mobile}`;
            const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;

            const response = await authAPI.registerEmail({
                email: formData.username,
                password: formData.newPassword,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: fullPhone,
                address: fullAddress,
            });

            if (response.success && response.data) {
                console.log('Registration successful:', response.data);
                
                try {
                    let firebaseIdToken: string;
                    
                    if (response.data.customToken) {
                        const { signInWithCustomTokenFirebase } = await import('../../config/firebase-client');
                        firebaseIdToken = await signInWithCustomTokenFirebase(response.data.customToken);
                    } else {
                        firebaseIdToken = await signInWithEmail(formData.username, formData.newPassword);
                    }
                    
                    const loginResponse = await authAPI.loginEmail({
                        email: formData.username,
                        firebaseToken: firebaseIdToken,
                    });
                    
                    if (loginResponse.success && loginResponse.data) {
                        onAuthSuccess?.(loginResponse.data.user);
                        onClose();
                        
                        // Redirect to profile page
                        router.push('/profile');
                    } else {
                        alert('Registration successful! Please sign in with your credentials.');
                        switchMode();
                    }
                } catch (loginError: any) {
                    console.error('Auto-login error:', loginError);
                    alert('Registration successful! Please sign in with your credentials.');
                    switchMode();
                }
            } else {
                setError(response.error?.message || 'Registration failed');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const firebaseToken = await signInWithGoogle();
            const response = await authAPI.loginGoogle({ firebaseToken });
            
            if (response.success && response.data) {
                console.log('Google sign-in successful:', response.data);
                onAuthSuccess?.(response.data.user);
                onClose();
                
                // Redirect to profile page
                router.push('/profile');
            } else {
                setError(response.error?.message || 'Google sign-in failed');
            }
        } catch (err: any) {
            console.error('Google sign in error:', err);
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) {
            return;
        }

        if (isSignIn) {
            await handleSignIn();
        } else if (signUpStep < 3) {
            setSignUpStep(signUpStep + 1);
        } else {
            await handleSignUp();
        }
    };

    const handleBack = () => {
        if (signUpStep > 1) {
            setSignUpStep(signUpStep - 1);
            setError(null);
        }
    };

    const switchMode = () => {
        setIsSignIn(!isSignIn);
        setSignUpStep(1);
        setError(null);
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
            case 1: return 'Create Account';
            case 2: return 'Your Address';
            case 3: return 'Account Details';
            default: return 'Create Account';
        }
    };

    const getStepSubtitle = () => {
        if (isSignIn) return 'Enter your credentials to access your account';
        switch (signUpStep) {
            case 1: return 'Let\'s start with your basic information';
            case 2: return 'Where can we reach you?';
            case 3: return 'Set up your login credentials';
            default: return 'Fill in your details to get started';
        }
    };

    const getImageForState = () => {
        if (isSignIn) {
            return "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=1000&fit=crop";
        }
        switch (signUpStep) {
            case 1: return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=1000&fit=crop";
            case 2: return "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800&h=1000&fit=crop";
            case 3: return "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=1000&fit=crop";
            default: return "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=1000&fit=crop";
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
                            className="bg-white/20 backdrop-blur-xl border border-white/20 h-160 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex"
                            style={{ maxHeight: '90vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={loading}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {!isSignIn && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            {[1, 2, 3].map((step) => (
                                                <React.Fragment key={step}>
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors bg-gradient-to-br from-primary via-80% via-black to-black text-white ${signUpStep >= step ? 'shadow-md shadow-primary' : ''}`}
                                                        >
                                                            {step}
                                                        </div>
                                                        <span className="text-xs mt-1 text-gray-300">
                                                            {step === 1 ? 'Info' : step === 2 ? 'Address' : 'Account'}
                                                        </span>
                                                    </div>
                                                    {step < 3 && (
                                                        <div className={`flex-1 h-1 mx-2 rounded transition-colors -mt-4 ${signUpStep > step ? 'bg-gradient-to-l from-primary to-black' : 'bg-gray-200'}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h2 className="text-3xl text-white mb-2">{getStepTitle()}</h2>
                                    <p className="text-gray-400">{getStepSubtitle()}</p>
                                </div>

                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex-1 space-y-4 pr-2">
                                        {isSignIn && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Email address</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your email"
                                                        disabled={loading}
                                                        className="w-full px-4 py-2 text-sm text-white border border-white/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="block text-sm font-medium text-white">Password</label>
                                                        <button type="button" className="text-xs text-primary hover:underline">forgot password?</button>
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="••••••"
                                                        disabled={loading}
                                                        className="w-full px-4 py-2 text-sm text-white tracking-widest border border-white/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="remember"
                                                        checked={rememberMe}
                                                        onChange={(e) => setRememberMe(e.target.checked)}
                                                        disabled={loading}
                                                        className="w-4 h-4 border-gray-300 rounded focus:ring-amber-500 disabled:opacity-50"
                                                    />
                                                    <label htmlFor="remember" className="ml-2 text-sm text-gray-400">Remember for 60 days</label>
                                                </div>
                                            </>
                                        )}

                                        {!isSignIn && signUpStep === 1 && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-white mb-1">First name</label>
                                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-white mb-1">Last name</label>
                                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Mobile number</label>
                                                    <div className="flex gap-2">
                                                        <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} disabled={loading} className="px-3 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50">
                                                            {countryCodes.map((item) => (
                                                                <option key={item.code} value={item.code}>{item.country} {item.code}</option>
                                                            ))}
                                                        </select>
                                                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="123 456 7890" disabled={loading} className="flex-1 px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {!isSignIn && signUpStep === 2 && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Street Address</label>
                                                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="123 Main Street" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-white mb-1">City</label>
                                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="New York" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-white mb-1">State/Province</label>
                                                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="NY" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-white mb-1">ZIP/Postal Code</label>
                                                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="10001" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-white mb-1">Country</label>
                                                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="United States" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {!isSignIn && signUpStep === 3 && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Email (Username)</label>
                                                    <input type="email" name="username" value={formData.username} onChange={handleInputChange} placeholder="your@email.com" disabled={loading} className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Password</label>
                                                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="Create a password (min 6 characters)" disabled={loading} className="w-full px-4 py-2 text-sm text-white tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">Confirm Password</label>
                                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" disabled={loading} className="w-full px-4 py-2 text-sm text-white tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:opacity-50" />
                                                </div>
                                            </>
                                        )}

                                        <div className="flex gap-4 pt-4">
                                            {!isSignIn && signUpStep > 1 && (
                                                <Button variant="secondary" size="md" onClick={handleBack} disabled={loading} className="flex-1 md:w-41 w-32">Back</Button>
                                            )}
                                            <Button variant="primary" size="md" onClick={handleSubmit} disabled={loading} className={!isSignIn && signUpStep > 1 ? 'flex-1 md:w-41 w-35' : 'md:w-41 w-35'}>
                                                {loading ? 'Processing...' : (!isSignIn && signUpStep < 3 ? 'Next' : isSignIn ? 'Login' : 'Sign Up')}
                                            </Button>
                                        </div>

                                        {isSignIn && (
                                            <>
                                                <div className="relative my-6">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-300"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-4 py-1 bg-gray-600 text-white rounded-2xl border border-b-gray-300">Or</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-50">
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Google</span>
                                                    </button>
                                                    <button type="button" disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-50">
                                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#CBCBCB">
                                                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Apple</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-100 flex-shrink-0">
                                        <span className="text-sm text-gray-300">
                                            {isSignIn ? "Don't have an account? " : "Already have an account? "}
                                        </span>
                                        <button type="button" onClick={switchMode} disabled={loading} className="ml-2 text-sm text-primary font-semibold hover:underline disabled:opacity-50">
                                            {isSignIn ? 'Sign Up' : 'Sign In'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Image side - same as before */}
                            <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                                <AnimatePresence mode="sync">
                                    <motion.div
                                        key={isSignIn ? 'signin' : `signup-${signUpStep}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                        className="absolute inset-0"
                                    >
                                        <img src={getImageForState()} alt="Happy pets" className="w-full h-full object-cover rounded-2xl" />
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