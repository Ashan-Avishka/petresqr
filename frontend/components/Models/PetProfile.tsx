'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, User, HeartPulse, Navigation } from 'lucide-react';
import { foundAPI } from '../../api/found-api';
import { getImageUrl } from '../../api/config';

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
              className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {!showNotifyForm ? (
                /* ── Pet Profile View ── */
                <div className="flex flex-col">
                  {/* Square image */}
                  <div className="relative w-full overflow-hidden bg-black/40">
                    {pet.photoUrl ? (
                      <img
                        src={getImageUrl(pet.photoUrl)}
                        alt={pet.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl">🐾</span>
                      </div>
                    )}
                    <button
                      onClick={onClose}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name bar */}
                  <div className="px-5 pt-4 pb-3 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white leading-tight">{pet.name}</h2>
                    <p className="text-gray-400 text-sm mt-0.5">{pet.breed} · {pet.age} yrs</p>
                  </div>

                  {/* Info grid */}
                  <div className="px-5 py-4 grid grid-cols-2 gap-3">
                    {/* Owner */}
                    <div className="col-span-2 bg-white/5 rounded-xl p-3 flex items-center gap-3">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Owner</p>
                        <p className="text-white text-sm font-medium truncate">{pet.owner.name}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-white text-xs truncate">{pet.owner.email}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2 min-w-0">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-white text-xs truncate">{pet.owner.phone}</p>
                      </div>
                    </div>

                    {/* Medical — only if present */}
                    {pet.medical.conditions !== 'None' && (
                      <div className="bg-red-950/40 rounded-xl p-3 flex items-start gap-2 col-span-2">
                        <HeartPulse className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-400">Medical Conditions</p>
                          <p className="text-white text-sm">{pet.medical.conditions}</p>
                        </div>
                      </div>
                    )}

                    {pet.medical.allergies !== 'None' && (
                      <div className="bg-orange-950/40 rounded-xl p-3 flex items-start gap-2 col-span-2">
                        <HeartPulse className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-orange-400">Allergies</p>
                          <p className="text-white text-sm">{pet.medical.allergies}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notify button */}
                  <div className="px-5 pb-5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowNotifyForm(true)}
                      className="w-full py-3 bg-gradient-to-tl from-black to-primary text-white font-semibold rounded-xl shadow-sm shadow-primary hover:shadow-md transition-all"
                    >
                      Notify Owner
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* ── Notify Form View ── */
                <div className="flex flex-col max-h-[90vh] overflow-y-auto">
                  {/* Form header */}
                  <div className="sticky top-0 bg-zinc-900 border-b border-white/10 px-5 py-4 flex items-center justify-between z-10">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Notify Owner</h3>
                      <p className="text-xs text-gray-400 mt-0.5">All fields optional</p>
                    </div>
                    <button
                      onClick={() => setShowNotifyForm(false)}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                    >
                      <X className="w-4 h-4" /> Back
                    </button>
                  </div>

                  <div className="px-5 py-4 space-y-5">
                    <p className="text-sm text-gray-400">
                      More details help reunite <span className="text-white">{pet.name}</span> with their owner faster.
                    </p>

                    {/* Contact fields */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your Contact</p>
                      {[
                        { label: 'Name', name: 'finderContact.name', type: 'text', placeholder: 'John Doe' },
                        { label: 'Phone', name: 'finderContact.phone', type: 'tel', placeholder: '+1234567890' },
                        { label: 'Email', name: 'finderContact.email', type: 'email', placeholder: 'john@example.com' },
                      ].map(f => (
                        <div key={f.name}>
                          <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                          <input
                            type={f.type}
                            name={f.name}
                            value={f.name.split('.').reduce((o: any, k) => o?.[k], formData) ?? ''}
                            onChange={handleInputChange}
                            placeholder={f.placeholder}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Location</p>
                      <input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        placeholder="123 Main St, City"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 hover:border-primary/40 rounded-lg text-gray-300 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Navigation className="w-4 h-4" />
                        {gettingLocation ? 'Getting location…' : 'Use current location'}
                      </button>
                      {formData.location.latitude && formData.location.longitude && (
                        <div className="bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2 flex items-center justify-between">
                          <p className="text-xs text-green-400 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            {formData.location.latitude.toFixed(5)}, {formData.location.longitude.toFixed(5)}
                          </p>
                          <a
                            href={getGoogleMapsLink() || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View map →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Condition + Notes */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pet Condition</p>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/60 transition-colors"
                      >
                        <option value="HEALTHY">Healthy</option>
                        <option value="INJURED">Injured</option>
                        <option value="SICK">Sick</option>
                        <option value="UNKNOWN">Unknown</option>
                      </select>
                      <textarea
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Found near the park, seems friendly…"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/60 resize-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNotifyOwner}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-tl from-black to-primary text-white font-semibold rounded-xl shadow-sm shadow-primary hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending…' : 'Send Notification'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PetProfileModal;