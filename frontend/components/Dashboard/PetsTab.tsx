import React, { Fragment, useState } from 'react';
import { Dog, Plus } from 'lucide-react';
import PetCard from './PetCard';
import { useUserContext } from '../../contexts/UserContext';
import type { Pet } from '../../api/pet-types';
import CreatePetModal from '../Models/CreatePetModal';
import { NotificationModal } from '../Models/MessageModal';

const PetsTab: React.FC = () => {
    const { pets, tags, deletePet, updatePet, togglePetGallery, createPet } = useUserContext();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [notifType, setNotifType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');

    const availableTags = tags.filter(tag => 
        tag.status === 'available' && !tag.pet
    );

    const handleDeletePet = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            const success = await deletePet(id);
            if (!success) {
                setNotifType('error');
                setNotifTitle('Deletion Failed');
                setNotifMessage('Failed to delete the pet. Please try again later.');
                setIsOpen(true);
            }
            setNotifType('success');
            setNotifTitle('Pet Deleted');
            setNotifMessage('The pet has been deleted successfully.');
            setIsOpen(true);
        }
    };

    const handleSave = async (id: string, data: Pet) => {
        try {
            console.log('Saving pet:', id, data);

            const success = await updatePet(id, data);

            if (success) {
                setNotifType('success');
                setNotifTitle('Pet Updated');
                setNotifMessage('The pet information has been updated successfully.');
                setIsOpen(true);
            } else {
                setNotifType('error');
                setNotifTitle('Update Failed');
                setNotifMessage('Failed to update the pet. Please try again later.');
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            setNotifType('error');
            setNotifTitle('Update Failed');
            setNotifMessage('An error occurred while updating the pet. Please try again later.');
            setIsOpen(true);
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
        <div className="h-full overflow-y-auto md:pr-4 pr-2">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="hidden md:block">
                    <h2 className="text-4xl font-bold text-white">My Pets</h2>
                    <p className="text-gray-400 mt-1">Manage your pet's information</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-br from-primary via-black to-black text-white rounded-lg shadow-sm hover:shadow-md hover:scale-105 shadow-primary transition-all text-sm md:text-base ml-auto"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add New Pet
                </button>
            </div>

            <div className="space-y-3 md:space-y-4">
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
            <NotificationModal
                isOpen={isOpen}
                type={notifType}
                title={notifTitle}
                message= {notifMessage}
                onDismiss={() => setIsOpen(false)}
            />
        </div>
    );
};

export default PetsTab;