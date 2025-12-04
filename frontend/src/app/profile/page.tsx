"use client";

import React, { useState } from 'react';
import { Dog, Tag, User } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUserContext } from '../../../contexts/UserContext';
import PetsTab from '../../../components/Dashboard/PetsTab';
import TagsTab from '../../../components/Dashboard/TagsTab';
import ProfileTab from '../../../components/Dashboard/ProfileTab';

const CustomerDashboard = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuthContext();
    const { loading, error } = useUserContext();
    const [activeTab, setActiveTab] = useState('pets');

    const tabs = [
        { id: 'pets', label: 'My Pets', icon: Dog },
        { id: 'tags', label: 'Tags', icon: Tag },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br bg-primary/60 via-black to-black flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br bg-primary/60 via-black to-black flex items-center justify-center">
                <div className="text-white text-xl">Please log in to view your dashboard</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br bg-primary/60 via-black to-black pb-20">
            <div className="flex max-w-7xl mx-auto pt-30">
                {/* Left Sidebar Navigation */}
                <div className="w-64 h-[800px] bg-black p-6 rounded-xl">
                    <nav className="space-y-5">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg transition-all border-b-1 border-primary ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-110'
                                            : 'text-gray-300 hover:bg-gradient-to-br from-primary via-black via-40% to-black hover:scale-105'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    {activeTab === 'pets' && <PetsTab />}
                    {activeTab === 'tags' && <TagsTab />}
                    {activeTab === 'profile' && <ProfileTab />}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;