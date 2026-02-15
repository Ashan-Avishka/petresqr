import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, Cat, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import type { Pet } from '../../api/pet-types';
import { getImageUrl } from '../../api/config';

interface PetCardProps {
    pet: Pet;
    onEdit: () => void;
    onDelete: (id: string) => void;
    onSave?: (id: string, data: any) => Promise<void>;
    onToggleGallery?: (id: string, gallery: boolean) => Promise<void>;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete, onSave, onToggleGallery }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('bio');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(pet);
    const [isSaving, setIsSaving] = useState(false);
    const [isTogglingGallery, setIsTogglingGallery] = useState(false);

    const petSections = [
        { id: 'bio', label: 'Bio' },
        { id: 'medical', label: 'Medical' },
        { id: 'story', label: 'Story' },
        { id: 'tag', label: 'Tag' },
        { id: 'other', label: 'Other' }
    ];

    const handleEdit = () => {
        setIsEditing(true);
        setIsExpanded(true);
        setEditedData(pet);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(pet);
    };

    const handleSave = async () => {
        if (!onSave) return;
        
        setIsSaving(true);
        try {
            await onSave(pet.id, editedData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleGallery = async () => {
        if (!onToggleGallery) return;
        
        setIsTogglingGallery(true);
        try {
            await onToggleGallery(pet.id, !pet.gallery);
        } catch (error) {
            console.error('Failed to toggle gallery:', error);
        } finally {
            setIsTogglingGallery(false);
        }
    };

    const updateField = (section: string, field: string, value: any) => {
        setEditedData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof Pet],
                [field]: value
            }
        }));
    };

    const updateTopLevel = (field: string, value: any) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const displayData = isEditing ? editedData : pet;
    
    // Get the full image URL
    const imageUrl = getImageUrl(displayData.image);

    return (
        <motion.div
            layout
            key={pet.id}
            className="bg-gradient-to-br from-primary via-black to-black rounded-xl hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
            onClick={() => !isEditing && setIsExpanded(!isExpanded)}
        >
            <div className="p-6">
                <div className="flex items-center gap-4">
                    <img
                        src={imageUrl}
                        alt={displayData.name}
                        className="w-20 h-20 rounded-lg object-cover shadow-lg shadow-black"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Imagexx';
                        }}
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={displayData.name}
                                    onChange={(e) => updateTopLevel('name', e.target.value)}
                                    className="text-white text-2xl bg-gray-800 rounded px-2 py-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            ) : (
                                <h3 className="text-white text-2xl">{displayData.name}</h3>
                            )}
                            {displayData.type === 'dog' ? (
                                <Dog className="w-5 h-5 text-primary" />
                            ) : (
                                <Cat className="w-5 h-5 text-primary" />
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm shadow-primary ${
                                displayData.tag.status === 'active'
                                    ? 'bg-black text-gray-300'
                                    : 'bg-gray-400 text-gray-100'
                            }`}>
                                {displayData.tag.status === 'active' ? 'Active' : 'inactive'}
                            </span>
                            {pet.gallery && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 shadow-sm shadow-green-500">
                                    In Gallery
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-300">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={displayData.breed}
                                        onChange={(e) => updateTopLevel('breed', e.target.value)}
                                        className=" bg-gray-800 text-gray-300 rounded px-2 py-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm w-24"
                                        placeholder="Breed"
                                    />
                                    <span>|</span>
                                    <input
                                        type="number"
                                        value={displayData.age}
                                        onChange={(e) => updateTopLevel('age', Number(e.target.value))}
                                        className="bg-gray-800 rounded px-2 py-1 border border-primary text-sm w-16 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Age"
                                    />
                                    <span>years |</span>
                                    <input
                                        type="number"
                                        value={displayData.weight}
                                        onChange={(e) => updateTopLevel('weight', Number(e.target.value))}
                                        className="bg-gray-800 rounded px-2 py-1 border border-primary text-sm w-16 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Weight"
                                    />
                                    <span>kg</span>
                                </>
                            ) : (
                                <>
                                    <span>{displayData.breed}</span>
                                    <span>|</span>
                                    <span>{displayData.age} years</span>
                                    <span>|</span>
                                    <span>{displayData.weight} kg</span>
                                    <span>|</span>
                                    <span className="font-mono text-xs">{displayData.tag.tagId || 'No tag'}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Gallery Toggle Button */}
                        <button
                            onClick={handleToggleGallery}
                            disabled={isTogglingGallery}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                                pet.gallery
                                    ? 'hover:bg-gray-800 text-green-300'
                                    : 'hover:bg-gray-800 text-gray-400'
                            }`}
                            title={pet.gallery ? 'Remove from gallery' : 'Add to gallery'}
                        >
                            {pet.gallery ? (
                                <Eye className="w-5 h-5" />
                            ) : (
                                <EyeOff className="w-5 h-5" />
                            )}
                        </button>

                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="p-2 hover:bg-green-900 rounded-lg transition-colors disabled:opacity-50 text-green-400"
                                >
                                    save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 text-gray-400"
                                >
                                    close
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-5 h-5 text-primary" />
                                </button>
                                <button
                                    onClick={() => onDelete(pet._id)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-400" />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6 pt-6 border-t border-gray-400">
                                {/* Section Tabs */}
                                <div className="flex gap-2 border-b border-gray-400 mb-6">
                                    {petSections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveSection(section.id);
                                            }}
                                            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                                                activeSection === section.id
                                                    ? 'text-white'
                                                    : 'text-gray-300 hover:text-gray-100'
                                            }`}
                                        >
                                            {section.label}
                                            {activeSection === section.id && (
                                                <motion.div
                                                    layoutId={`section-${pet._id}`}
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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
                                        className="space-y-4 min-h-[20rem]"
                                    >
                                        {activeSection === 'bio' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-gray-400">Description</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.bio.description}
                                                            onChange={(e) => updateField('bio', 'description', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                                                            placeholder="Add a description..."
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.bio.description || 'No description added'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Birth Date</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={displayData.bio.birthDate}
                                                            onChange={(e) => updateField('bio', 'birthDate', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.bio.birthDate || 'Not set'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Gender</label>
                                                    {isEditing ? (
                                                        <select
                                                            value={displayData.gender}
                                                            onChange={(e) => updateTopLevel('gender', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                        </select>
                                                    ) : (
                                                        <p className="text-gray-300 mt-1 capitalize">{displayData.gender}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Color</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={displayData.color}
                                                            onChange={(e) => updateTopLevel('color', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Color"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.color || 'Not specified'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Weight</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={displayData.weight}
                                                            onChange={(e) => updateTopLevel('weight', Number(e.target.value))}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Weight in kg"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.weight} kg</p>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-gray-400">Microchip ID</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={displayData.bio.microchipId}
                                                            onChange={(e) => updateField('bio', 'microchipId', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                                            placeholder="Microchip ID"
                                                        />
                                                    ) : (
                                                        displayData.bio.microchipId && <p className="text-gray-300 mt-1 font-mono">{displayData.bio.microchipId}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeSection === 'medical' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Allergies</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.medical.allergies}
                                                            onChange={(e) => updateField('medical', 'allergies', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                                            placeholder="Allergies"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.medical.allergies || 'None reported'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Current Medications</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.medical.medications}
                                                            onChange={(e) => updateField('medical', 'medications', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                                            placeholder="Medications"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.medical.medications || 'None'}</p>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-gray-400">Medical Conditions</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.medical.conditions}
                                                            onChange={(e) => updateField('medical', 'conditions', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                                            placeholder="Medical conditions"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.medical.conditions || 'None reported'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Veterinarian</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={displayData.medical.vetName}
                                                            onChange={(e) => updateField('medical', 'vetName', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Vet name"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.medical.vetName || 'Not set'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Vet Phone</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="tel"
                                                            value={displayData.medical.vetPhone}
                                                            onChange={(e) => updateField('medical', 'vetPhone', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Vet phone"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.medical.vetPhone || 'Not set'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeSection === 'story' && (
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Story Status</label>
                                                    {isEditing ? (
                                                        <select
                                                            value={displayData.story.status}
                                                            onChange={(e) => updateField('story', 'status', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="protected">Protected</option>
                                                            <option value="reunited">Reunited</option>
                                                            <option value="adopted">Adopted</option>
                                                            <option value="lost">Lost</option>
                                                            <option value="found">Found</option>
                                                        </select>
                                                    ) : (
                                                        <div className="mt-1">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                                                displayData.story.status === 'protected' ? 'bg-blue-900 text-blue-300' :
                                                                displayData.story.status === 'reunited' ? 'bg-green-900 text-green-300' :
                                                                displayData.story.status === 'adopted' ? 'bg-purple-900 text-purple-300' :
                                                                displayData.story.status === 'lost' ? 'bg-red-900 text-red-300' :
                                                                'bg-yellow-900 text-yellow-300'
                                                            }`}>
                                                                {displayData.story.status}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Location</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={displayData.story.location}
                                                            onChange={(e) => updateField('story', 'location', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="e.g., New York, NY"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.story.location || 'Not specified'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Story Content</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.story.content}
                                                            onChange={(e) => updateField('story', 'content', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                                                            placeholder="Share your pet's story..."
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1 whitespace-pre-wrap">{displayData.story.content || 'No story added yet'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeSection === 'tag' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Tag ID</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={displayData.tag.tagId}
                                                            onChange={(e) => updateField('tag', 'tagId', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                                            placeholder="Tag ID"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 font-mono mt-1">{displayData.tag.tagId || 'No tag assigned'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Status</label>
                                                    {isEditing ? (
                                                        <select
                                                            value={displayData.tag.status}
                                                            onChange={(e) => updateField('tag', 'status', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    ) : (
                                                        <div className="mt-1">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                                                displayData.tag.status === 'active'
                                                                    ? 'bg-black text-primary shadow-sm shadow-primary'
                                                                    : 'bg-gray-400 text-gray-800'
                                                            }`}>
                                                                {displayData.tag.status === 'active' ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-gray-400">Activated Date</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={displayData.tag.activatedDate}
                                                            onChange={(e) => updateField('tag', 'activatedDate', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        />
                                                    ) : (
                                                        displayData.tag.activatedDate && <p className="text-gray-300 mt-1">{displayData.tag.activatedDate}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeSection === 'other' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Favorite Food</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={displayData.other.favoriteFood}
                                                            onChange={(e) => updateField('other', 'favoriteFood', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Favorite food"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.other.favoriteFood || 'Not specified'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Behavior Notes</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.other.behavior}
                                                            onChange={(e) => updateField('other', 'behavior', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                                            placeholder="Behavior notes"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.other.behavior || 'No notes added'}</p>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-gray-400">Special Needs</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            value={displayData.other.specialNeeds}
                                                            onChange={(e) => updateField('other', 'specialNeeds', e.target.value)}
                                                            className="w-full bg-gray-800 text-gray-300 rounded px-3 py-2 mt-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                                            placeholder="Special needs"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-300 mt-1">{displayData.other.specialNeeds || 'None'}</p>
                                                    )}
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

export default PetCard;