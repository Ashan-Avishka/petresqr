import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { petAPI } from '../api/pet-api';
import { tagAPI } from '../api/tag-api';
import { userAPI } from '../api/user-api';
import type { Pet } from '../api/pet-types';
import type { Tag as TagType } from '../api/tag-types';

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
}

interface UserContextType {
    userProfile: UserProfile;
    pets: Pet[];
    tags: TagType[];
    loading: boolean;
    error: string | null;
    updateUserProfile: (updates: Partial<UserProfile>) => void;
    saveUserProfile: () => Promise<boolean>;
    updatePet: (id: string, data: Pet) => Promise<boolean>;
    deletePet: (id: string) => Promise<boolean>;
    activateTag: (tagId: string) => Promise<boolean>;
    refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [pets, setPets] = useState<Pet[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
    });

    // Load user data on mount and when authentication changes
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserData();
        }
    }, [isAuthenticated, user]);

    const loadUserData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load user profile
            const profileResponse = await userAPI.getProfile();
            if (profileResponse.success && profileResponse.data) {
                const userData = profileResponse.data;
                setUserProfile({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phone: userData.phone || '',
                    address: userData.address || '',
                });
            }

            // Load pets
            const petsResponse = await petAPI.getPets();
            console.log('Pets Response:', petsResponse); // Debug log
            if (petsResponse.success && petsResponse.data) {
                // Check if data has a 'pets' property or is an array directly
                const petsData = Array.isArray(petsResponse.data) 
                    ? petsResponse.data 
                    : petsResponse.data.pets || [];
                console.log('Loaded pets:', petsData); // Debug log
                setPets(petsData);
            }

            // Load tags
            const tagsResponse = await tagAPI.getTags();
            if (tagsResponse.success && tagsResponse.data) {
                setTags(tagsResponse.data.tags);
            }
        } catch (err: any) {
            console.error('Error loading user data:', err);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const updateUserProfile = (updates: Partial<UserProfile>) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    const saveUserProfile = async (): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await userAPI.updateProfile({
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                phone: userProfile.phone,
                address: userProfile.address,
            }); 

            alert(JSON.stringify(response));
            
            if (response.success) {
                return true;
            } else {
                setError(response.error?.message || 'Failed to update profile');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePet = async (id: string, data: Pet): Promise<boolean> => {
        try {
            setError(null);
            console.log('Updating pet:', id, data); // Debug log
            const response = await petAPI.updatePet({ petId: id, ...data });
            console.log('Update response:', response); // Debug log
            
            if (response.success && response.data) {
                // Update the pet in local state
                setPets(prev => prev.map(pet => {
                    // Check both _id and id properties
                    const petId = pet.id;
                    const matchId = petId === id;
                    console.log(`Comparing pet ${petId} with ${id}: ${matchId}`); // Debug log
                    return matchId ? response.data!.pet : pet;
                }));
                console.log('Pet updated successfully'); // Debug log
                return true;
            } else {
                setError(response.error?.message || 'Failed to update pet');
                return false;
            }
        } catch (err: any) {
            console.error('Error updating pet:', err);
            setError(err.message || 'Failed to update pet');
            return false;
        }
    };

    const deletePet = async (id: string): Promise<boolean> => {
        const response = await petAPI.deletePet({ petId: id });
        if (response.success) {
            // Check both _id and id properties
            setPets(prev => prev.filter(p => {
                const petId = p._id || p.id;
                return petId !== id;
            }));
            return true;
        } else {
            setError(response.error?.message || 'Failed to delete pet');
            return false;
        }
    };

    const activateTag = async (tagId: string): Promise<boolean> => {
        const response = await tagAPI.updateTag({ tagId, status: 'active' });
        if (response.success && response.data) {
            setTags(prev => prev.map(tag =>
                tag._id === tagId ? response.data!.tag : tag
            ));
            return true;
        } else {
            setError(response.error?.message || 'Failed to activate tag');
            return false;
        }
    };

    const refreshUserData = async () => {
        await loadUserData();
    };

    const value: UserContextType = {
        userProfile,
        pets,
        tags,
        loading,
        error,
        updateUserProfile,
        saveUserProfile,
        updatePet,
        deletePet,
        activateTag,
        refreshUserData
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};