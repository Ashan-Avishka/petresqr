import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { petAPI } from '../api/pet-api';
import { tagAPI } from '../api/tag-api';
import { userAPI } from '../api/user-api';
import { orderAPI } from '../api/order-api';
import type { Pet } from '../api/pet-types';
import type { Tag as TagType } from '../api/tag-types';
import type { Order } from '../api/order-types';

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
    orders: Order[];
    loading: boolean;
    error: string | null;
    updateUserProfile: (updates: Partial<UserProfile>) => void;
    saveUserProfile: () => Promise<boolean>;
    createPet: (formData: FormData) => Promise<boolean>;
    updatePet: (id: string, data: Pet) => Promise<boolean>;
    deletePet: (id: string) => Promise<boolean>;
    togglePetGallery: (id: string, gallery: boolean) => Promise<boolean>;
    activateTag: (tagId: string) => Promise<boolean>;
    cancelOrder: (orderId: string) => Promise<boolean>;
    refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [pets, setPets] = useState<Pet[]>([]);
    const [tags, setTags] = useState<TagType[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
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
            console.log('Pets Response:', petsResponse);
            if (petsResponse.success && petsResponse.data) {
                const petsData = Array.isArray(petsResponse.data) 
                    ? petsResponse.data 
                    : petsResponse.data.pets || [];
                console.log('Loaded pets:', petsData);
                setPets(petsData);
            }

            // Load tags
            const tagsResponse = await tagAPI.getTags();
            if (tagsResponse.success && tagsResponse.data) {
                setTags(tagsResponse.data.tags);
            }

            // Load orders
            const ordersResponse = await orderAPI.getOrders({ limit: 100 });
            console.log('Orders Response:', ordersResponse);
            if (ordersResponse.ok && ordersResponse.data) {
                setOrders(ordersResponse.data || []);
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

    const createPet = async (formData: FormData): Promise<boolean> => {
    try {
        setError(null);
        const response = await petAPI.createPet(formData);
        
        if (response.success && response.data) {
            // Add the new pet to local state
            setPets(prev => [...prev, response.data!.pet]);
            
            // Refresh tags to update their assignment status
            await loadUserData();
            return true;
        } else {
            setError(response.error?.message || 'Failed to create pet');
            return false;
        }
    } catch (err: any) {
        console.error('Error creating pet:', err);
        setError(err.message || 'Failed to create pet');
        return false;
    }
};

    const updatePet = async (id: string, data: Pet): Promise<boolean> => {
        try {
            setError(null);
            console.log('Updating pet:', id, data);
            const response = await petAPI.updatePet({ petId: id, ...data });
            console.log('Update response:', response);
            
            if (response.success && response.data) {
                setPets(prev => prev.map(pet => {
                    const petId = pet.id;
                    const matchId = petId === id;
                    console.log(`Comparing pet ${petId} with ${id}: ${matchId}`);
                    return matchId ? response.data!.pet : pet;
                }));
                console.log('Pet updated successfully');
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

    const togglePetGallery = async (id: string, gallery: boolean): Promise<boolean> => {
        try {
            setError(null);
            console.log('Toggling gallery for pet:', id, gallery);
            const response = await petAPI.toggleGallery({ petId: id, gallery });
            console.log('Toggle gallery response:', response);
            
            if (response.success && response.data) {
                // Update the pet in local state
                setPets(prev => prev.map(pet => {
                    const petId = pet.id || pet._id;
                    if (petId === id) {
                        return { ...pet, gallery };
                    }
                    return pet;
                }));
                console.log('Gallery status toggled successfully');
                return true;
            } else {
                setError(response.error?.message || 'Failed to toggle gallery status');
                return false;
            }
        } catch (err: any) {
            console.error('Error toggling gallery:', err);
            setError(err.message || 'Failed to toggle gallery status');
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

    const cancelOrder = async (orderId: string): Promise<boolean> => {
        try {
            setError(null);
            const response = await orderAPI.cancelOrder(orderId);
            
            if (response.ok && response.data) {
                // Update the order in local state
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? response.data!.order : order
                ));
                return true;
            } else {
                setError(response.error?.message || 'Failed to cancel order');
                return false;
            }
        } catch (err: any) {
            console.error('Error cancelling order:', err);
            setError(err.message || 'Failed to cancel order');
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
        orders,
        loading,
        error,
        updateUserProfile,
        saveUserProfile,
        createPet,
        updatePet,
        deletePet,
        togglePetGallery,
        activateTag,
        cancelOrder,
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