import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, Dog, Cat, Rabbit, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface Tag {
  _id: string;
  tagId: string;
  status: 'active' | 'inactive' | 'assigned';
  petId?: string;
}

interface CreatePetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  availableTags: Tag[];
}

const CreatePetModal: React.FC<CreatePetModalProps> = ({ isOpen, onClose, onSubmit, availableTags }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    color: '',
    dateOfBirth: '',
    bio: {
      description: '',
      microchipId: '',
    },
    medical: {
      allergies: '',
      medications: '',
      conditions: '',
      vetName: '',
      vetPhone: '',
    },
    other: {
      favoriteFood: '',
      behavior: '',
      specialNeeds: '',
    },
    story: {
      enabled: false,
      content: '',
      location: '',
      status: 'protected',
    },
  });

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Pet details' },
    { number: 2, title: 'Assign Tag', description: 'Select a tag' },
    { number: 3, title: 'Medical', description: 'Health info' },
    { number: 4, title: 'Additional', description: 'Extra details' },
    { number: 5, title: 'Story (Optional)', description: 'Share story' },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.breed || !formData.age) {
          alert('Please fill in Name, Breed, and Age');
          return false;
        }
        return true;
      case 2:
        if (!selectedTag) {
          alert('Please select a tag to assign to your pet');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();

      submitData.append('name', formData.name);
      submitData.append('type', formData.type);
      submitData.append('breed', formData.breed);
      submitData.append('age', formData.age);
      submitData.append('weight', formData.weight);
      submitData.append('gender', formData.gender);
      submitData.append('color', formData.color);
      submitData.append('tagId', selectedTag);

      if (formData.dateOfBirth) {
        submitData.append('dateOfBirth', formData.dateOfBirth);
      }

      submitData.append('bio[description]', formData.bio.description);
      submitData.append('bio[microchipId]', formData.bio.microchipId);

      submitData.append('medical[allergies]', formData.medical.allergies);
      submitData.append('medical[medications]', formData.medical.medications);
      submitData.append('medical[conditions]', formData.medical.conditions);
      submitData.append('medical[vetName]', formData.medical.vetName);
      submitData.append('medical[vetPhone]', formData.medical.vetPhone);

      submitData.append('other[favoriteFood]', formData.other.favoriteFood);
      submitData.append('other[behavior]', formData.other.behavior);
      submitData.append('other[specialNeeds]', formData.other.specialNeeds);

      // Only include story if enabled
      if (formData.story.enabled) {
        submitData.append('gallery', 'true');
        submitData.append('story[content]', formData.story.content);
        submitData.append('story[location]', formData.story.location);
        submitData.append('story[status]', formData.story.status);
      } else {
        submitData.append('gallery', 'false');
      }

      if (selectedFile) {
        submitData.append('photo', selectedFile);
      }

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error creating pet:', error);
      alert('Failed to create pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      weight: '',
      gender: 'male',
      color: '',
      dateOfBirth: '',
      bio: { description: '', microchipId: '' },
      medical: { allergies: '', medications: '', conditions: '', vetName: '', vetPhone: '' },
      other: { favoriteFood: '', behavior: '', specialNeeds: '' },
      story: { enabled: false, content: '', location: '', status: 'protected' },
    });
    setImagePreview(null);
    setSelectedFile(null);
    setSelectedTag('');
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [field]: value },
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className='flex'>
              <div className='w-1/4'>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pet Photo
                </label>
                <div className="flex gap-4">
                  {imagePreview ? (
                    <div className="relative w-45 h-35 rounded-lg overflow-hidden border-2 border-primary">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-45 h-35 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer"
                    >
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Upload Photo</span>
                      <span className="text-xs text-gray-500 mt-1">Max 5MB</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="w-3/4 space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter pet name"
                />

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('type', 'dog')}
                      className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${formData.type === 'dog'
                        ? 'bg-gradient-to-br from-primary via-black to-black text-white shadow-sm shadow-primary'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                      <Dog className="w-5 h-5" />
                      Dog
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('type', 'cat')}
                      className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${formData.type === 'cat'
                        ? 'bg-gradient-to-br from-primary via-black to-black text-white shadow-sm shadow-primary'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                      <Cat className="w-5 h-5" />
                      Cat
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('type', 'other')}
                      className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${formData.type === 'other'
                        ? 'bg-gradient-to-br from-primary via-black to-black text-white shadow-sm shadow-primary'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                      <Rabbit className="w-5 h-5" />
                      Other
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => updateField('breed', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter breed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Age in years"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Weight"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Pet color"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-300">
                Select a tag to assign to your pet. This tag will be linked to your pet's profile.
              </p>
            </div>

            {availableTags.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Available Tags</h3>
                <p className="text-gray-400">You need to purchase tags before adding a pet.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableTags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => setSelectedTag(tag._id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedTag === tag._id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Tag ID: {tag.qrCode}</p>
                        <p className="text-sm text-gray-400 capitalize">Status: {tag.status}</p>
                      </div>
                      {selectedTag === tag._id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* <div>
              <h3 className="text-lg font-semibold text-white mb-3">Bio Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.bio.description}
                    onChange={(e) => updateNestedField('bio', 'description', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder="Tell us about your pet..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Microchip ID
                  </label>
                  <input
                    type="text"
                    value={formData.bio.microchipId}
                    onChange={(e) => updateNestedField('bio', 'microchipId', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder="Microchip ID"
                  />
                </div>
              </div>
            </div> */}

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Medical Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Allergies
                  </label>
                  <textarea
                    value={formData.medical.allergies}
                    onChange={(e) => updateNestedField('medical', 'allergies', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                    placeholder="Known allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medications
                  </label>
                  <textarea
                    value={formData.medical.medications}
                    onChange={(e) => updateNestedField('medical', 'medications', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                    placeholder="Current medications..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    value={formData.medical.conditions}
                    onChange={(e) => updateNestedField('medical', 'conditions', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                    placeholder="Medical conditions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Veterinarian Name
                  </label>
                  <input
                    type="text"
                    value={formData.medical.vetName}
                    onChange={(e) => updateNestedField('medical', 'vetName', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Vet name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vet Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.medical.vetPhone}
                    onChange={(e) => updateNestedField('medical', 'vetPhone', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Vet phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favorite Food
              </label>
              <input
                type="text"
                value={formData.other.favoriteFood}
                onChange={(e) => updateNestedField('other', 'favoriteFood', e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Favorite food"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Behavior Notes
              </label>
              <textarea
                value={formData.other.behavior}
                onChange={(e) => updateNestedField('other', 'behavior', e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                placeholder="Behavioral traits..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Needs
              </label>
              <textarea
                value={formData.other.specialNeeds}
                onChange={(e) => updateNestedField('other', 'specialNeeds', e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                placeholder="Special needs or requirements..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-purple-200 mb-2">
                Share your pet's story with the community! When you enable this, your pet will appear in the public gallery.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-primary transition-colors">
              <input
                type="checkbox"
                checked={formData.story.enabled}
                onChange={(e) => updateNestedField('story', 'enabled', e.target.checked)}
                className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-white font-medium">Enable Pet Story & Gallery</span>
                <p className="text-sm text-gray-400">Your pet will be visible in the public gallery</p>
              </div>
            </label>

            {formData.story.enabled && (
              <div className="space-y-4 pt-4">
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Story Status
                    </label>
                    <select
                      value={formData.story.status}
                      onChange={(e) => updateNestedField('story', 'status', e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="protected">Protected</option>
                      <option value="reunited">Reunited</option>
                      <option value="adopted">Adopted</option>
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.story.location}
                      onChange={(e) => updateNestedField('story', 'location', e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Story Content
                  </label>
                  <textarea
                    value={formData.story.content}
                    onChange={(e) => updateNestedField('story', 'content', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                    placeholder="Share your pet's story with the community..."
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-140"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-150 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-primary via-black via-30% to-black rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-primary/20">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Pet</h2>
                  <p className="text-sm text-gray-200 mt-1">Step {currentStep} of {steps.length}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between mb-8">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.number
                            ? 'bg-gradient-to-br from-primary via-black to-black shadow-sm shadow-primary text-white'
                            : currentStep === step.number
                              ? 'bg-gradient-to-br from-primary  to-black text-white shadow-md shadow-primary'
                              : 'bg-gray-800 text-gray-400'
                            }`}
                        >
                          {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={`text-xs font-medium ${currentStep >= step.number ? 'text-white' : 'text-gray-500'
                            }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-2 ${currentStep > step.number ? 'bg-primary' : 'bg-gray-800'
                            }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto min-h-[calc(90vh-350px)] px-6 pb-4">
                {renderStepContent()}
              </div>

              <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={currentStep === 1 ? handleClose : handlePrev}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {currentStep === 1 ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </>
                  )}
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-br from-primary to-black text-white rounded-lg hover:shadow-md shadow-primary shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || availableTags.length === 0}
                    className="px-6 py-2 bg-gradient-to-br from-primary to-black text-white rounded-lg hover:shadow-md shadow-primary shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Pet'}
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePetModal;