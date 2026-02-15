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
    deactivateTag: (tagId: string) => Promise<boolean>;
    assignTag: (tagId: string, petId: string) => Promise<boolean>;
    unassignTag: (tagId: string) => Promise<boolean>;
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

    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserData();
        }
    }, [isAuthenticated, user]);

    const loadUserData = async () => {
        setLoading(true);
        setError(null);

        try {
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

            const petsResponse = await petAPI.getPets();
            if (petsResponse.success && petsResponse.data) {
                const petsData = Array.isArray(petsResponse.data)
                    ? petsResponse.data
                    : petsResponse.data.pets || [];
                setPets(petsData);
            }

            const tagsResponse = await tagAPI.getTags();
            if (tagsResponse.success && tagsResponse.data) {
                setTags(tagsResponse.data.tags);
            }

            const ordersResponse = await orderAPI.getOrders({ limit: 100 });
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
                const newPet = response.data.pet || response.data;
                setPets(prev => [...prev, newPet]);
                await loadUserData();
                return true;
            } else {
                setError(response.error?.message || 'Failed to create pet');
                return false;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create pet');
            return false;
        }
    };

    const updatePet = async (id: string, data: Pet): Promise<boolean> => {
        try {
            setError(null);
            const response = await petAPI.updatePet({ petId: id, ...data });
            if (response.success && response.data) {
                setPets(prev => prev.map(pet =>
                    (pet.id === id || pet._id === id) ? response.data!.pet : pet
                ));
                return true;
            } else {
                setError(response.error?.message || 'Failed to update pet');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update pet');
            return false;
        }
    };

    const deletePet = async (id: string): Promise<boolean> => {
        const response = await petAPI.deletePet({ petId: id });
        if (response.success) {
            setPets(prev => prev.filter(p => (p._id || p.id) !== id));
            return true;
        } else {
            setError(response.error?.message || 'Failed to delete pet');
            return false;
        }
    };

    const togglePetGallery = async (id: string, gallery: boolean): Promise<boolean> => {
        try {
            setError(null);
            const response = await petAPI.toggleGallery({ petId: id, gallery });
            if (response.success && response.data) {
                setPets(prev => prev.map(pet =>
                    (pet.id === id || pet._id === id) ? { ...pet, gallery } : pet
                ));
                return true;
            } else {
                setError(response.error?.message || 'Failed to toggle gallery status');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to toggle gallery status');
            return false;
        }
    };

    /**
     * Activate tag - simplified to only need tagId
     * Backend handles two flows:
     * 1. First-time: finds available QRCode and assigns it
     * 2. Re-activation: sets isActive = true
     */
    const activateTag = async (tagId: string): Promise<boolean> => {
        try {
            setError(null);
            const response = await tagAPI.activateTag(tagId);
            if (response.success) {
                await loadUserData();
                return true;
            } else {
                setError(response.error?.message || 'Failed to activate tag');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to activate tag');
            return false;
        }
    };

    /**
     * Deactivate tag - sets isActive = false
     */
    const deactivateTag = async (tagId: string): Promise<boolean> => {
        try {
            setError(null);
            const response = await tagAPI.deactivateTag(tagId);
            if (response.success) {
                await loadUserData();
                return true;
            } else {
                setError(response.error?.message || 'Failed to deactivate tag');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to deactivate tag');
            return false;
        }
    };

    /**
     * Assign tag to a pet
     */
    const assignTag = async (tagId: string, petId: string): Promise<boolean> => {
        try {
            setError(null);
            const response = await tagAPI.assignTag({ tagId, petId });
            if (response.success) {
                await loadUserData();
                return true;
            } else {
                setError(response.error?.message || 'Failed to assign tag');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to assign tag');
            return false;
        }
    };

    /**
     * Unassign tag from pet — sets pet status to 'inactive'
     */
    const unassignTag = async (tagId: string): Promise<boolean> => {
        try {
            setError(null);
            const response = await tagAPI.unassignTag({ tagId });
            if (response.success) {
                await loadUserData();
                return true;
            } else {
                setError(response.error?.message || 'Failed to unassign tag');
                return false;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to unassign tag');
            return false;
        }
    };

    const cancelOrder = async (orderId: string): Promise<boolean> => {
        try {
            setError(null);
            const response = await orderAPI.cancelOrder(orderId);
            if (response.ok && response.data) {
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? response.data!.order : order
                ));
                return true;
            } else {
                setError(response.error?.message || 'Failed to cancel order');
                return false;
            }
        } catch (err: any) {
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
        deactivateTag,
        assignTag,
        unassignTag,
        cancelOrder,
        refreshUserData,
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