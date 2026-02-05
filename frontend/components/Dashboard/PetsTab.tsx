import React, { Fragment, useState } from 'react';
import { Dog, Plus } from 'lucide-react';
import PetCard from './PetCard';
import { useUserContext } from '../../contexts/UserContext';
import type { Pet } from '../../api/pet-types';
import CreatePetModal from '../Models/CreatePetModal';

const PetsTab: React.FC = () => {
    const { pets, tags, deletePet, updatePet, togglePetGallery, createPet } = useUserContext();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const availableTags = tags.filter(tag => 
        tag.status === 'active' && !tag.petId
    );

    const handleDeletePet = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            const success = await deletePet(id);
            if (!success) {
                alert('Failed to delete pet');
            }
        }
    };

    const handleSave = async (id: string, data: Pet) => {
        try {
            console.log('Saving pet:', id, data);

            const success = await updatePet(id, data);

            if (success) {
                console.log('Pet updated successfully!');
            } else {
                alert('Failed to update pet');
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            alert('Failed to update pet');
        }
    };

    const handleToggleGallery = async (petId: string, gallery: boolean) => {
        const success = await togglePetGallery(petId, gallery);
        if (success) {
            console.log('Gallery status updated successfully');
        }
    };

    const handleCreatePetSubmit = async (formData: FormData) => {
        try {
            const success = await createPet(formData);
            if (success) {
                setIsCreateModalOpen(false);
                // Optional: Show success toast/notification
                console.log('Pet created successfully!');
            } else {
                throw new Error('Failed to create pet');
            }
        } catch (error) {
            console.error('Error creating pet:', error);
            throw error; // Let the modal handle the error display
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-4xl font-bold text-white">My Pets</h2>
                    <p className="text-gray-400 mt-1">Manage your pet's information</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary via-black to-black text-white rounded-lg shadow-sm hover:shadow-md hover:scale-105 shadow-primary transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add New Pet
                </button>
            </div>

            <div className="space-y-8">
                {pets.map(pet => (
                    <Fragment key={pet.id}>
                        <PetCard
                            pet={pet}
                            onEdit={() => { }}
                            onToggleGallery={handleToggleGallery}
                            onDelete={handleDeletePet}
                            onSave={handleSave}
                        />
                    </Fragment>
                ))}
            </div>

            {pets.length === 0 && (
                <div className="text-center py-16">
                    <Dog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No pets yet</h3>
                    <p className="text-gray-400 mb-6">Add your first pet to get started</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                    >
                        Add Your First Pet
                    </button>
                </div>
            )}

            <CreatePetModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreatePetSubmit}
                availableTags={availableTags}
            />
        </div>
    );
};

export default PetsTab;