import React, { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useUserContext } from '../../contexts/UserContext';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

// Memoized input field component to prevent unnecessary re-renders
const InputField = React.memo(({ 
  field, 
  label, 
  value,
  error,
  isTouched,
  editingProfile,
  onChange,
  type = 'text', 
  icon: Icon, 
  required = false,
  multiline = false 
}: {
  field: string;
  label: string;
  value: string;
  error?: string;
  isTouched: boolean;
  editingProfile: boolean;
  onChange: (field: string, value: string) => void;
  type?: string;
  icon: React.ComponentType<any>;
  required?: boolean;
  multiline?: boolean;
}) => {
  const showError = isTouched && error;
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(field, e.target.value);
  }, [field, onChange]);

  if (!editingProfile) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2 text-white">
          <Icon className="w-5 h-5 text-gray-400" />
          <span>{value || 'Not set'}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-white bg-black/50 ${
              showError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-amber-500'
            }`}
            rows={2}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white bg-black/50 ${
              showError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-amber-500'
            }`}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        )}
        
        {showError && (
          <>
            <div className="absolute right-3 top-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </>
        )}
      </div>
    </div>
  );
});

const ProfileTab: React.FC = () => {
    const { userProfile, updateUserProfile, saveUserProfile, loading } = useUserContext();
    const [editingProfile, setEditingProfile] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState(userProfile);

    // Sync form data with context profile when not editing
    useEffect(() => {
        if (!editingProfile) {
            setFormData(userProfile);
        }
    }, [userProfile, editingProfile]);

    // Validation rules
    const validateField = useCallback((field: string, value: string): string => {
        switch (field) {
            case 'firstName':
                if (!value.trim()) return 'First name is required';
                if (value.length < 2) return 'First name must be at least 2 characters';
                if (value.length > 50) return 'First name must be less than 50 characters';
                if (!/^[a-zA-Z\s\-']+$/.test(value)) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
                return '';
            
            case 'lastName':
                if (!value.trim()) return 'Last name is required';
                if (value.length < 2) return 'Last name must be at least 2 characters';
                if (value.length > 50) return 'Last name must be less than 50 characters';
                if (!/^[a-zA-Z\s\-']+$/.test(value)) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
                return '';
            
            case 'phone':
                if (!value.trim()) return ''; // Phone is optional
                const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(cleanPhone)) {
                    return 'Please enter a valid phone number';
                }
                return '';
            
            case 'address':
                if (!value.trim()) return ''; // Address is optional
                if (value.length > 200) return 'Address must be less than 200 characters';
                return '';
            
            default:
                return '';
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        const errors: ValidationErrors = {};
        
        errors.firstName = validateField('firstName', formData.firstName);
        errors.lastName = validateField('lastName', formData.lastName);
        errors.phone = validateField('phone', formData.phone || '');
        errors.address = validateField('address', formData.address || '');

        setValidationErrors(errors);
        
        return !Object.values(errors).some(error => error !== '');
    }, [formData, validateField]);

    // Real-time validation for touched fields
    useEffect(() => {
        if (editingProfile && touchedFields.size > 0) {
            const newErrors: ValidationErrors = {};
            
            touchedFields.forEach(field => {
                const value = formData[field as keyof typeof formData] || '';
                newErrors[field as keyof ValidationErrors] = validateField(field, value.toString());
            });
            
            setValidationErrors(prev => ({ ...prev, ...newErrors }));
        }
    }, [formData, touchedFields, editingProfile, validateField]);

    const handleProfileSave = async () => {
        // Mark all fields as touched before final validation
        const allFields = new Set(['firstName', 'lastName', 'phone', 'address']);
        setTouchedFields(allFields);

        if (!validateForm()) {
            alert('Please fix the validation errors before saving.');
            return;
        }

        // Update context with form data
        updateUserProfile(formData);
        const success = await saveUserProfile();
        
        if (success) {
            setShowSuccess(true);
            setEditingProfile(false);
            setTouchedFields(new Set());
            setTimeout(() => setShowSuccess(false), 3000);
        } else {
            alert('Failed to update profile');
        }
    };

    const handleInputChange = useCallback((field: string, value: string) => {
        // For phone field, allow spaces and common formatting characters
        if (field === 'phone') {
            // Allow numbers, spaces, parentheses, hyphens, and plus sign
            const phoneRegex = /^[0-9\s\-\(\)\+]*$/;
            if (!phoneRegex.test(value)) {
                return; // Don't update if invalid character
            }
        }

        // Update local state immediately for better responsiveness
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Mark field as touched for validation
        setTouchedFields(prev => {
            const newSet = new Set(prev);
            newSet.add(field);
            return newSet;
        });
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingProfile(false);
        setValidationErrors({});
        setTouchedFields(new Set());
        // Reset form data to original context data
        setFormData(userProfile);
    }, [userProfile]);

    const handleEditToggle = useCallback(() => {
        if (editingProfile) {
            handleProfileSave();
        } else {
            setEditingProfile(true);
            // Initialize form data with current user profile when starting to edit
            setFormData(userProfile);
        }
    }, [editingProfile, handleProfileSave, userProfile]);

    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    const isSaveDisabled = loading || hasErrors;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-4xl font-bold text-white">My Profile</h2>
                    <p className="text-gray-400 mt-1">Manage your account information</p>
                </div>
                
                {showSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        Profile updated successfully!
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {editingProfile && (
                        <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    
                    <button
                        onClick={handleEditToggle}
                        disabled={isSaveDisabled}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary via-black via-80% to-black shadow-md shadow-primary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : editingProfile ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-black via-primary/80 via-80% to-black text-white shadow-md shadow-primary/40 rounded-2xl p-8">
                {editingProfile && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-amber-400 text-sm">
                            <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required.
                            Please ensure all information is correct before saving.
                        </p>
                        <p className="text-amber-400 text-sm mt-1">
                            <strong>Phone:</strong> You can use spaces, dashes, or parentheses for formatting (e.g., +1 (555) 123-4567)
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            field="firstName"
                            label="First Name"
                            value={formData.firstName}
                            error={validationErrors.firstName}
                            isTouched={touchedFields.has('firstName')}
                            editingProfile={editingProfile}
                            onChange={handleInputChange}
                            icon={User}
                            required
                        />

                        <InputField
                            field="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            error={validationErrors.lastName}
                            isTouched={touchedFields.has('lastName')}
                            editingProfile={editingProfile}
                            onChange={handleInputChange}
                            icon={User}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email
                            </label>
                            <div className="flex items-center gap-2 text-white">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span>{userProfile.email}</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
                        </div>

                        <InputField
                            field="phone"
                            label="Phone"
                            value={formData.phone || ''}
                            error={validationErrors.phone}
                            isTouched={touchedFields.has('phone')}
                            editingProfile={editingProfile}
                            onChange={handleInputChange}
                            type="tel"
                            icon={Phone}
                        />

                        <div className="md:col-span-2">
                            <InputField
                                field="address"
                                label="Address"
                                value={formData.address || ''}
                                error={validationErrors.address}
                                isTouched={touchedFields.has('address')}
                                editingProfile={editingProfile}
                                onChange={handleInputChange}
                                icon={MapPin}
                                multiline
                            />
                        </div>
                    </div>

                    {editingProfile && hasErrors && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Please fix the validation errors above before saving your profile.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;