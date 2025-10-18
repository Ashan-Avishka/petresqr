"use client";

import React, { useState } from 'react';
import { Phone, Printer, Mail, MapPin } from 'lucide-react';

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        howDidYouFind: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
            {/* Yellow decorative shapes */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-800"></div>
            <div className="absolute top-0 right-0 w-1/4 h-2/3 bg-amber-800"></div>
            
            <div className="relative z-10 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left side - Form */}
                        <div className="space-y-8">
                            {/* Header */}
                            <div>
                                <h1 className="text-5xl font-bold text-slate-900 mb-4">
                                    Get in <span className="text-amber-500">Touch</span>
                                </h1>
                                <p className="text-slate-600 text-lg max-w-md">
                                    Enim tempor eget pharetra facilisis sed maecenas adipiscing. Eu leo molestie vel, ornare non id blandit netus.
                                </p>
                            </div>

                            {/* Contact Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Name *"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone number *"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <select
                                        name="howDidYouFind"
                                        value={formData.howDidYouFind}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 0.75rem center',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="">How did you find us?</option>
                                        <option value="search">Search Engine</option>
                                        <option value="social">Social Media</option>
                                        <option value="friend">Friend/Family</option>
                                        <option value="advertisement">Advertisement</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-4 rounded-lg transition-colors shadow-lg"
                                >
                                    SEND
                                </button>
                            </form>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Phone className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-semibold text-sm mb-1">PHONE</p>
                                        <p className="text-pink-500 text-sm">03 5432 1234</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Printer className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-semibold text-sm mb-1">FAX</p>
                                        <p className="text-pink-500 text-sm">03 5432 1234</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Mail className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-semibold text-sm mb-1">EMAIL</p>
                                        <p className="text-pink-500 text-sm break-all">info@marcc.com.au</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Map */}
                        <div className="lg:pl-12">
                            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                                <div className="relative h-[500px] lg:h-[600px]">
                                    {/* Map placeholder - Replace with actual map integration */}
                                    <div className="w-full h-full bg-stone-200 relative">
                                        {/* This is a placeholder. In production, integrate Google Maps or similar */}
                                        <iframe
                                            title="Location Map"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.194830199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2s!4v1234567890"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}