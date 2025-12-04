import React, { Fragment } from 'react';
import { Dog } from 'lucide-react';
import PetCard from './PetCard';
import { useUserContext } from '../../contexts/UserContext';
import type { Pet } from '../../api/pet-types';

const PetsTab: React.FC = () => {
    const { pets, deletePet, updatePet } = useUserContext();

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
            
            // Call the updatePet function from context
            const success = await updatePet(id, data);
            
            if (success) {
                // Optional: Show success message
                console.log('Pet updated successfully!');
            } else {
                alert('Failed to update pet');
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            alert('Failed to update pet');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-4xl font-bold text-white">My Pets</h2>
                    <p className="text-gray-400 mt-1">Manage your pet's information</p>
                </div>
            </div>

            <div className="space-y-8">
                {pets.map(pet => (
                    <Fragment key={pet.id}>
                        <PetCard
                            pet={pet}
                            onEdit={() => { }}
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
                </div>
            )}
        </div>
    );
};

export default PetsTab;