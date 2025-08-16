// src/scripts/seedDatabase.ts
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Pet } from '../models/Pet';
import { Tag } from '../models/Tag';
import { Order } from '../models/Order';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  try {
    await connectDatabase();
    
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminUser = new User({
      firebaseUid: 'admin-uid-123',
      email: 'admin@pettag.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'admin',
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create sample users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        firebaseUid: `user-uid-${i}`,
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Test',
        phone: `+123456789${i}`,
      });
      await user.save();
      users.push(user);
    }
    console.log('✅ Sample users created');

    // Create sample pets
    const petNames = ['Buddy', 'Luna', 'Charlie', 'Bella', 'Max', 'Lucy', 'Cooper', 'Daisy'];
    const breeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'];
    
    const pets = [];
    for (let i = 0; i < petNames.length; i++) {
      const pet = new Pet({
        name: petNames[i],
        breed: breeds[i % breeds.length],
        age: Math.floor(Math.random() * 10) + 1,
        medicalConditions: i % 3 === 0 ? 'Allergic to chicken' : undefined,
        status: i % 4 === 0 ? 'active' : 'inactive',
        ownerId: users[i % users.length]._id,
        photoUrl: `https://via.placeholder.com/400x300?text=${petNames[i]}`,
      });
      await pet.save();
      pets.push(pet);
    }
    console.log('✅ Sample pets created');

    // Create sample tags for active pets
    const activePets = pets.filter(pet => pet.status === 'active');
    for (const pet of activePets) {
      const tag = new Tag({
        petId: pet._id,
        qrCode: uuidv4(),
        status: 'active',
        activatedAt: new Date(),
      });
      await tag.save();
      
      // Fix: Type assertion to resolve TypeScript error
      pet.tagId = tag._id as Types.ObjectId;
      await pet.save();
    }
    console.log('✅ Sample tags created');

    console.log('🎉 Database seeded successfully!');
    
    // Print admin credentials
    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@pettag.com');
    console.log('Use Firebase Auth for login');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };