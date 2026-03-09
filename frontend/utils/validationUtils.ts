// ─── Shared Validation Helpers ───────────────────────────────────────────────

export const validators = {
  required: (value: string) => (value.trim() ? null : 'This field is required'),

  email: (value: string) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Enter a valid email address';
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  confirmPassword: (password: string, confirm: string) => {
    if (!confirm) return 'Please confirm your password';
    return password === confirm ? null : 'Passwords do not match';
  },

  phone: (value: string) => {
    if (!value.trim()) return 'Mobile number is required';
    const phoneRegex = /^[\d\s\-().+]{7,15}$/;
    return phoneRegex.test(value.replace(/\s/g, '')) ? null : 'Enter a valid phone number';
  },

  zipCode: (value: string) => {
    if (!value.trim()) return 'ZIP/Postal code is required';
    return /^[\w\s\-]{3,10}$/.test(value) ? null : 'Enter a valid ZIP/postal code';
  },

  minLength: (min: number) => (value: string) => {
    if (!value.trim()) return 'This field is required';
    return value.trim().length >= min ? null : `Must be at least ${min} characters`;
  },

  positiveNumber: (value: string) => {
    if (!value) return 'This field is required';
    const n = Number(value);
    return !isNaN(n) && n >= 0 ? null : 'Enter a valid positive number';
  },

  vetPhone: (value: string) => {
    if (!value.trim()) return null; // optional field
    const phoneRegex = /^[\d\s\-().+]{7,15}$/;
    return phoneRegex.test(value.replace(/\s/g, '')) ? null : 'Enter a valid phone number';
  },
};

// ─── Auth Modal Validation ────────────────────────────────────────────────────

export type AuthFieldErrors = Partial<Record<string, string>>;

export function validateSignIn(formData: { email: string; password: string }): AuthFieldErrors {
  return {
    email: validators.email(formData.email) ?? undefined,
    password: validators.password(formData.password) ?? undefined,
  };
}

export function validateSignUpStep1(formData: {
  firstName: string;
  lastName: string;
  mobile: string;
}): AuthFieldErrors {
  return {
    firstName: validators.required(formData.firstName) ?? undefined,
    lastName: validators.required(formData.lastName) ?? undefined,
    mobile: validators.phone(formData.mobile) ?? undefined,
  };
}

export function validateSignUpStep2(formData: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}): AuthFieldErrors {
  return {
    street: validators.required(formData.street) ?? undefined,
    city: validators.required(formData.city) ?? undefined,
    state: validators.required(formData.state) ?? undefined,
    zipCode: validators.zipCode(formData.zipCode) ?? undefined,
    country: validators.required(formData.country) ?? undefined,
  };
}

export function validateSignUpStep3(formData: {
  username: string;
  newPassword: string;
  confirmPassword: string;
}): AuthFieldErrors {
  return {
    username: validators.email(formData.username) ?? undefined,
    newPassword: validators.password(formData.newPassword) ?? undefined,
    confirmPassword:
      validators.confirmPassword(formData.newPassword, formData.confirmPassword) ?? undefined,
  };
}

export function hasErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some((v) => v !== undefined && v !== null);
}

// ─── Pet Modal Validation ─────────────────────────────────────────────────────

export type PetFieldErrors = Partial<Record<string, string>>;

export function validatePetStep1(formData: {
  name: string;
  breed: string;
  age: string;
  weight: string;
}): PetFieldErrors {
  return {
    name: validators.required(formData.name) ?? undefined,
    breed: validators.required(formData.breed) ?? undefined,
    age: validators.positiveNumber(formData.age) ?? undefined,
    weight: formData.weight ? (validators.positiveNumber(formData.weight) ?? undefined) : undefined,
  };
}

export function validatePetStep2(selectedTag: string): PetFieldErrors {
  return {
    tag: selectedTag ? undefined : 'Please select a tag for your pet',
  };
}

export function validatePetStep3(medical: {
  vetPhone: string;
}): PetFieldErrors {
  return {
    vetPhone: validators.vetPhone(medical.vetPhone) ?? undefined,
  };
}