"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, Cat, Edit2, Trash2, Plus, X, Save, User, Tag, ArrowLeft, Phone, Mail, MapPin, Calendar } from 'lucide-react';

// Types
interface Pet {
    id: string;
    name: string;
    type: 'dog' | 'cat' | 'other';
    breed: string;
    age: number;
    weight: number;
    gender: 'male' | 'female';
    color: string;
    image: string;
    bio: {
        description: string;
        birthDate: string;
        microchipId?: string;
    };
    medical: {
        allergies: string;
        medications: string;
        conditions: string;
        vetName: string;
        vetPhone: string;
    };
    tag: {
        tagId: string;
        activatedDate: string;
        status: 'active' | 'inactive';
    };
    other: {
        favoriteFood: string;
        behavior: string;
        specialNeeds: string;
    };
}

interface TagData {
    id: string;
    tagId: string;
    purchaseDate: string;
    status: 'active' | 'inactive';
    assignedTo?: string;
    petName?: string;
}

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
}

// PetCard Component
const PetCard: React.FC<{
    pet: Pet;
    onEdit: () => void;
    onDelete: () => void;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({
    pet,
    onEdit,
    onDelete,
    isExpanded,
    onToggle
}) => {
        const [activeSection, setActiveSection] = useState('bio');

        const sections = [
            { id: 'bio', label: 'Bio' },
            { id: 'medical', label: 'Medical' },
            { id: 'tag', label: 'Tag' },
            { id: 'other', label: 'Other' }
        ];

        return (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <Image
                            width={80}
                            height={80}
                            src={pet.image}
                            alt={pet.name}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-900 text-lg">{pet.name}</h3>
                                {pet.type === 'dog' ? (
                                    <Dog className="w-5 h-5 text-amber-500" />
                                ) : (
                                    <Cat className="w-5 h-5 text-amber-500" />
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${pet.tag.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {pet.tag.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <span>{pet.breed}</span>
                                <span>|</span>
                                <span>{pet.age} years</span>
                                <span>|</span>
                                <span>{pet.weight} kg</span>
                                <span>|</span>
                                <span className="font-mono text-xs">{pet.tag.tagId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Edit2 className="w-5 h-5 text-amber-600" />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                            <button
                                onClick={onToggle}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all"
                            >
                                {isExpanded ? 'Show Less' : 'View Details'}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: '400px', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    {/* Section Tabs */}
                                    <div className="flex gap-2 border-b border-gray-200 mb-6">
                                        {sections.map(section => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeSection === section.id
                                                        ? 'text-amber-600'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                {section.label}
                                                {activeSection === section.id && (
                                                    <motion.div
                                                        layoutId={`petSection-${pet.id}`}
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Section Content */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeSection}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            {activeSection === 'bio' && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                                        <p className="text-gray-900 mt-1">{pet.bio.description || 'No description added'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Birth Date</label>
                                                        <p className="text-gray-900 mt-1">{pet.bio.birthDate}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Gender</label>
                                                        <p className="text-gray-900 mt-1 capitalize">{pet.gender}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Color</label>
                                                        <p className="text-gray-900 mt-1">{pet.color}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Weight</label>
                                                        <p className="text-gray-900 mt-1">{pet.weight} kg</p>
                                                    </div>
                                                    {pet.bio.microchipId && (
                                                        <div className="col-span-2">
                                                            <label className="text-sm font-medium text-gray-600">Microchip ID</label>
                                                            <p className="text-gray-900 mt-1 font-mono">{pet.bio.microchipId}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeSection === 'medical' && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Allergies</label>
                                                        <p className="text-gray-900 mt-1">{pet.medical.allergies || 'None reported'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Current Medications</label>
                                                        <p className="text-gray-900 mt-1">{pet.medical.medications || 'None'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                                                        <p className="text-gray-900 mt-1">{pet.medical.conditions || 'None reported'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Veterinarian</label>
                                                        <p className="text-gray-900 mt-1">{pet.medical.vetName}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Vet Phone</label>
                                                        <p className="text-gray-900 mt-1">{pet.medical.vetPhone}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {activeSection === 'tag' && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Tag ID</label>
                                                        <p className="text-gray-900 font-mono mt-1">{pet.tag.tagId}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                                        <div className="mt-1">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${pet.tag.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {pet.tag.status === 'active' ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Activated Date</label>
                                                        <p className="text-gray-900 mt-1">{pet.tag.activatedDate}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {activeSection === 'other' && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Favorite Food</label>
                                                        <p className="text-gray-900 mt-1">{pet.other.favoriteFood || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Behavior Notes</label>
                                                        <p className="text-gray-900 mt-1">{pet.other.behavior || 'No notes added'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-sm font-medium text-gray-600">Special Needs</label>
                                                        <p className="text-gray-900 mt-1">{pet.other.specialNeeds || 'None'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    };

// PetProfile Component
const PetProfile: React.FC<{ pet: Pet; onBack: () => void; onEdit: () => void }> = ({ pet, onBack, onEdit }) => {
    const [activeSection, setActiveSection] = useState('bio');

    const sections = [
        { id: 'bio', label: 'Bio' },
        { id: 'medical', label: 'Medical' },
        { id: 'tag', label: 'Tag' },
        { id: 'other', label: 'Other' }
    ];

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Pet Profile</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative h-64">
                    <Image
                        src={pet.image}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onEdit}
                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                        <Edit2 className="w-5 h-5 text-amber-600" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900">{pet.name}</h3>
                            <p className="text-gray-600 mt-1">{pet.breed} • {pet.age} years old</p>
                        </div>
                        {pet.type === 'dog' ? (
                            <Dog className="w-8 h-8 text-amber-500" />
                        ) : (
                            <Cat className="w-8 h-8 text-amber-500" />
                        )}
                    </div>

                    {/* Section Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 mb-6">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeSection === section.id
                                        ? 'text-amber-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {section.label}
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="petSection"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Section Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {activeSection === 'bio' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-900 mt-1">{pet.bio.description || 'No description added'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Birth Date</label>
                                            <p className="text-gray-900 mt-1">{pet.bio.birthDate}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Gender</label>
                                            <p className="text-gray-900 mt-1 capitalize">{pet.gender}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Color</label>
                                            <p className="text-gray-900 mt-1">{pet.color}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Weight</label>
                                            <p className="text-gray-900 mt-1">{pet.weight} kg</p>
                                        </div>
                                        {pet.bio.microchipId && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Microchip ID</label>
                                                <p className="text-gray-900 mt-1">{pet.bio.microchipId}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'medical' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Allergies</label>
                                        <p className="text-gray-900 mt-1">{pet.medical.allergies || 'None reported'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Current Medications</label>
                                        <p className="text-gray-900 mt-1">{pet.medical.medications || 'None'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                                        <p className="text-gray-900 mt-1">{pet.medical.conditions || 'None reported'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Veterinarian</label>
                                            <p className="text-gray-900 mt-1">{pet.medical.vetName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Vet Phone</label>
                                            <p className="text-gray-900 mt-1">{pet.medical.vetPhone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'tag' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5 text-amber-500" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Tag ID</label>
                                            <p className="text-gray-900 font-mono">{pet.tag.tagId}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <div className="mt-2">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${pet.tag.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {pet.tag.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Activated Date</label>
                                        <p className="text-gray-900 mt-1">{pet.tag.activatedDate}</p>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'other' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Favorite Food</label>
                                        <p className="text-gray-900 mt-1">{pet.other.favoriteFood || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Behavior Notes</label>
                                        <p className="text-gray-900 mt-1">{pet.other.behavior || 'No notes added'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Special Needs</label>
                                        <p className="text-gray-900 mt-1">{pet.other.specialNeeds || 'None'}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Main Dashboard Component
const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('pets');
    const [expandedPetId, setExpandedPetId] = useState<string | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);

    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+94 77 123 4567',
        address: '123 Main Street, Colombo 03',
        emergencyContact: 'Jane Doe',
        emergencyPhone: '+94 77 987 6543'
    });

    const [pets, setPets] = useState<Pet[]>([
        {
            id: '1',
            name: 'Max',
            type: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            weight: 30,
            gender: 'male',
            color: 'Golden',
            image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
            bio: {
                description: 'Friendly and energetic golden retriever who loves to play fetch',
                birthDate: '2021-03-15',
                microchipId: 'MC123456789'
            },
            medical: {
                allergies: 'Chicken',
                medications: 'None',
                conditions: 'None',
                vetName: 'Dr. Silva',
                vetPhone: '+94 11 234 5678'
            },
            tag: {
                tagId: 'TAG-2024-001',
                activatedDate: '2024-01-15',
                status: 'active'
            },
            other: {
                favoriteFood: 'Beef treats',
                behavior: 'Very friendly with children',
                specialNeeds: 'Needs daily exercise'
            }
        },
        {
            id: '2',
            name: 'Luna',
            type: 'cat',
            breed: 'Persian',
            age: 2,
            weight: 4,
            gender: 'female',
            color: 'White',
            image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
            bio: {
                description: 'Calm and affectionate indoor cat',
                birthDate: '2022-06-20',
                microchipId: 'MC987654321'
            },
            medical: {
                allergies: 'None',
                medications: 'None',
                conditions: 'None',
                vetName: 'Dr. Perera',
                vetPhone: '+94 11 876 5432'
            },
            tag: {
                tagId: 'TAG-2024-002',
                activatedDate: '2024-02-20',
                status: 'active'
            },
            other: {
                favoriteFood: 'Salmon',
                behavior: 'Indoor cat only, shy with strangers',
                specialNeeds: 'Daily grooming required'
            }
        }
    ]);

    const [tags, setTags] = useState<TagData[]>([
        {
            id: '1',
            tagId: 'TAG-2024-001',
            purchaseDate: '2024-01-10',
            status: 'active',
            assignedTo: '1',
            petName: 'Max'
        },
        {
            id: '2',
            tagId: 'TAG-2024-002',
            purchaseDate: '2024-02-15',
            status: 'active',
            assignedTo: '2',
            petName: 'Luna'
        },
        {
            id: '3',
            tagId: 'TAG-2024-003',
            purchaseDate: '2024-03-20',
            status: 'inactive'
        }
    ]);

    const tabs = [
        { id: 'pets', label: 'My Pets', icon: Dog },
        { id: 'tags', label: 'Tags', icon: Tag },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    const handleDeletePet = (id: string) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            setPets(pets.filter(p => p.id !== id));
        }
    };

    const handleActivateTag = (tagId: string) => {
        setTags(tags.map(tag =>
            tag.id === tagId ? { ...tag, status: 'active' as const } : tag
        ));
    };

    const handleProfileChange = (field: keyof UserProfile, value: string) => {
        setUserProfile({ ...userProfile, [field]: value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            {/* Header */}
            {/* <div className="bg-white shadow-sm border-b border-gray-200 pt-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Dog className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Pet Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {userProfile.name.split(' ')[0]}!</span>
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </div> */}

            <div className="flex max-w-7xl mx-auto pt-30">
                {/* Left Sidebar Navigation */}
                <div className="w-64 h-[800px] bg-gradient-to-b from-amber-400 to-transparent 0 p-6 rounded-xl">
                    <nav className="space-y-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setExpandedPetId(null);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-all ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-white to-amber-200 text-gray-900 shadow-md scale-110'
                                                : 'text-gray-600 hover:bg-gradient-to-r from-white/40 to-amber-200/40 hover:scale-105'
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
                    {activeTab === 'pets' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
                                    <p className="text-gray-600 mt-1">Manage your pet's information</p>
                                </div>
                                {/* <button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Pet
                </button> */}
                            </div>

                            <div className="space-y-4">
                                {pets.map(pet => (
                                    <PetCard
                                        key={pet.id}
                                        pet={pet}
                                        isExpanded={expandedPetId === pet.id}
                                        onToggle={() => setExpandedPetId(expandedPetId === pet.id ? null : pet.id)}
                                        onEdit={() => { }}
                                        onDelete={() => handleDeletePet(pet.id)}
                                    />
                                ))}
                            </div>

                            {pets.length === 0 && (
                                <div className="text-center py-16">
                                    <Dog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets yet</h3>
                                    <p className="text-gray-600 mb-6">Add your first pet to get started</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tags' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">My Tags</h2>
                                <p className="text-gray-600 mt-1">Manage your pet tracking tags</p>
                            </div>

                            <div className="grid gap-4">
                                {tags.map(tag => (
                                    <div key={tag.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                                                    <Tag className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 font-mono">{tag.tagId}</h3>
                                                    <p className="text-sm text-gray-600">Purchased: {tag.purchaseDate}</p>
                                                    {tag.petName && (
                                                        <p className="text-sm text-amber-600 mt-1">Assigned to: {tag.petName}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${tag.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {tag.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                                {tag.status === 'inactive' && (
                                                    <button
                                                        onClick={() => handleActivateTag(tag.id)}
                                                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                    <p className="text-gray-600 mt-1">Manage your account information</p>
                                </div>
                                <button
                                    onClick={() => setEditingProfile(!editingProfile)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    {editingProfile ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                                    {editingProfile ? 'Save Changes' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={userProfile.name}
                                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <User className="w-5 h-5 text-gray-400" />
                                                <span>{userProfile.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        {editingProfile ? (
                                            <input
                                                type="email"
                                                value={userProfile.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <span>{userProfile.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        {editingProfile ? (
                                            <input
                                                type="tel"
                                                value={userProfile.phone}
                                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <span>{userProfile.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        {editingProfile ? (
                                            <textarea
                                                value={userProfile.address}
                                                onChange={(e) => handleProfileChange('address', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                                                rows={2}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <MapPin className="w-5 h-5 text-gray-400" />
                                                <span>{userProfile.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                                {editingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={userProfile.emergencyContact}
                                                        onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-900">
                                                        <User className="w-5 h-5 text-gray-400" />
                                                        <span>{userProfile.emergencyContact}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                                {editingProfile ? (
                                                    <input
                                                        type="tel"
                                                        value={userProfile.emergencyPhone}
                                                        onChange={(e) => handleProfileChange('emergencyPhone', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-900">
                                                        <Phone className="w-5 h-5 text-gray-400" />
                                                        <span>{userProfile.emergencyPhone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;