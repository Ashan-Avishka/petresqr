'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, User, HeartPulse, Navigation } from 'lucide-react';
import Image from 'next/image';
import { foundAPI } from '../../api/found-api'; // Update import path as needed

interface PetProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: {
    name: string;
    breed: string;
    age: string;
    photoUrl: string;
    medical: {
      conditions: string;
      allergies: string;
    };
    tag: {
      qrCode: string;
      status: string;
    };
    owner: {
      name: string;
      email: string;
      phone: string;
    };
  } | null;
}

interface NotifyFormData {
  finderContact: {
    name: string;
    phone: string;
    email: string;
  };
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  condition: 'HEALTHY' | 'INJURED' | 'SICK' | 'UNKNOWN';
  additionalNotes: string;
}

const PetProfileModal: React.FC<PetProfileModalProps> = ({ isOpen, onClose, pet }) => {
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState<NotifyFormData>({
    finderContact: {
      name: '',
      phone: '',
      email: '',
    },
    location: {
      address: '',
      latitude: undefined,
      longitude: undefined,
    },
    condition: 'HEALTHY',
    additionalNotes: '',
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setShowNotifyForm(false);
      resetForm();
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      finderContact: {
        name: '',
        phone: '',
        email: '',
      },
      location: {
        address: '',
        latitude: undefined,
        longitude: undefined,
      },
      condition: 'HEALTHY',
      additionalNotes: '',
    });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter the address manually.');
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof NotifyFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNotifyOwner = async () => {
    if (!pet?.tag.qrCode) {
      alert('Unable to notify owner. QR code is missing.');
      return;
    }

    setLoading(true);
    try {
      const result = await foundAPI.notifyOwner({
        qrCode: pet.tag.qrCode,
        finderContact: {
          name: formData.finderContact.name || undefined,
          phone: formData.finderContact.phone || undefined,
          email: formData.finderContact.email || undefined,
        },
        location: {
          address: formData.location.address || undefined,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        },
        condition: formData.condition,
        additionalNotes: formData.additionalNotes || undefined,
      });

      if (result.success) {
        alert(`Owner has been notified successfully! 
        
        ${result.data.notificationsSent.sms ? '✅ SMS sent' : '❌ SMS not sent'}
        ${result.data.notificationsSent.email ? '✅ Email sent' : '❌ Email not sent'}
        ${result.data.notificationsSent.inApp ? '✅ In-app notification sent' : ''}`);
        onClose();
      } else {
        alert(result.error?.message || 'Failed to notify owner. Please try again.');
      }
    } catch (error) {
      console.error('Error notifying owner:', error);
      alert('Failed to notify owner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsLink = () => {
    if (formData.location.latitude && formData.location.longitude) {
      return `https://www.google.com/maps?q=${formData.location.latitude},${formData.location.longitude}`;
    }
    return null;
  };

  if (!pet) return null;

  const hasMedicalInfo = pet.medical.conditions !== 'None' || pet.medical.allergies !== 'None';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-tl from-black to-primary p-6 flex justify-between items-start z-10">
                <div className="flex items-center gap-4">
                  {pet.photoUrl && (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={pet.photoUrl}
                        alt={pet.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-white">{pet.name}</h2>
                    <p className="text-white">{pet.breed}</p>
                    <p className="text-white text-sm">{pet.age} years old</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {!showNotifyForm ? (
                  <>
                    {/* Medical Information */}
                    {hasMedicalInfo && (
                      <div className="space-y-4">
                        <h3 className="text-xl text-white flex items-center gap-2">
                          <HeartPulse className="w-5 h-5 text-red-500" />
                          Medical Information
                        </h3>

                        <div className="space-y-3">
                          {pet.medical.conditions !== 'None' && (
                            <div className="bg-black/20 p-4 rounded-lg border border-red-400">
                              <p className="text-sm text-red-400 font-semibold">
                                Medical Conditions
                              </p>
                              <p className="text-white mt-1">{pet.medical.conditions}</p>
                            </div>
                          )}

                          {pet.medical.allergies !== 'None' && (
                            <div className="bg-black/20 p-4 rounded-lg border border-orange-400">
                              <p className="text-sm text-orange-400 font-semibold">Allergies</p>
                              <p className="text-white mt-1">{pet.medical.allergies}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Owner Information */}
                    <div className="space-y-4">
                      <h3 className="text-xl text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Owner Information
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-gray-50/20 p-4 rounded-lg">
                          <User className="w-5 h-5 text-gray-300" />
                          <div>
                            <p className="text-sm text-gray-300">Name</p>
                            <p className="text-white font-medium">{pet.owner.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50/20 p-4 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-300" />
                          <div>
                            <p className="text-sm text-gray-300">Email</p>
                            <p className="text-white font-medium">{pet.owner.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50/20 p-4 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-300" />
                          <div>
                            <p className="text-sm text-gray-300">Phone</p>
                            <p className="text-white font-medium">{pet.owner.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notify Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowNotifyForm(true)}
                      className="w-full py-4 bg-gradient-to-tl from-black to-primary text-white font-semibold rounded-xl shadow-sm shadow-primary hover:shadow-md transition-all"
                    >
                      Notify Owner
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Notification Form */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl text-white">Notify Owner</h3>
                        <button
                          onClick={() => setShowNotifyForm(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          Back
                        </button>
                      </div>

                      <p className="text-sm text-gray-300">
                        Fill in your contact information and location details. All fields are
                        optional, but providing more information helps reunite {pet.name} with
                        their owner faster.
                      </p>

                      {/* Finder Contact */}
                      <div className="space-y-4">
                        <h4 className="text-white">Your Contact Information</h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="finderContact.name"
                            value={formData.finderContact.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Your Phone
                          </label>
                          <input
                            type="tel"
                            name="finderContact.phone"
                            value={formData.finderContact.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                            placeholder="+1234567890"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Your Email
                          </label>
                          <input
                            type="email"
                            name="finderContact.email"
                            value={formData.finderContact.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-4">
                        <h4 className="text-white">Location</h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="location.address"
                            value={formData.location.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                            placeholder="123 Main St, New York, NY"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                          >
                            <Navigation className="w-4 h-4" />
                            {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                          </button>
                        </div>

                        {formData.location.latitude && formData.location.longitude && (
                          <div className="bg-green-50/60 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Location captured: {formData.location.latitude.toFixed(6)},{' '}
                              {formData.location.longitude.toFixed(6)}
                            </p>
                            <a
                              href={getGoogleMapsLink() || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                            >
                              View on Google Maps →
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Pet Condition */}
                      <div className="space-y-4">
                        <h4 className="text-white">Pet Condition</h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Condition
                          </label>
                          <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-white"
                          >
                            <option value="HEALTHY">Healthy</option>
                            <option value="INJURED">Injured</option>
                            <option value="SICK">Sick</option>
                            <option value="UNKNOWN">Unknown</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Additional Notes
                          </label>
                          <textarea
                            name="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none focus:outline-none text-white placeholder-gray-400"
                            placeholder="Found near the park, seems friendly and well-fed..."
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNotifyOwner}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-tl from-black to-primary text-white font-semibold rounded-xl shadow-sm shadow-primary hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Sending Notification...' : 'Send Notification to Owner'}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PetProfileModal;