// src/scripts/seedDatabase.ts
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Pet } from '../models/Pet';
import { Tag } from '../models/Tag';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB:", mongoose.connection.name);

    // Clear entire DB
    await mongoose.connection.dropDatabase();
    console.log("🧹 Database cleared");

    console.log('🌱 Seeding database...');

    // Create admin
    const adminUser = await User.create({
      firebaseUid: 'admin-uid-123',
      email: 'admin@pettag.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'admin',
    });
    console.log('✅ Admin user created');

    // Create sample users
    const users: any[] = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        firebaseUid: `user-uid-${i}`,
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Test',
        phone: `+94 77 123 456${i}`,
        address: `${i * 10} Main Street, Colombo 0${i}`,
      });
      users.push(user);
    }
    console.log('✅ Sample users created');

    // Comprehensive pet data (same as before)
    const comprehensivePets = [
      {
        name: 'Max',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 30,
        gender: 'male',
        color: 'Golden',
        dateOfBirth: '2021-03-15',
        photoUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
        bio: {
          description: 'Friendly and energetic golden retriever who loves to play fetch',
          microchipId: 'MC123456789',
        },
        medical: {
          allergies: 'Chicken',
          medications: 'None',
          conditions: 'None',
          vetName: 'Dr. Silva',
          vetPhone: '+94 11 234 5678',
        },
        other: {
          favoriteFood: 'Beef treats',
          behavior: 'Very friendly with children',
          specialNeeds: 'Needs daily exercise',
        },
      },
      {
        name: 'Luna',
        type: 'cat',
        breed: 'Persian',
        age: 2,
        weight: 4,
        gender: 'female',
        color: 'White',
        dateOfBirth: '2022-06-20',
        photoUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop',
        bio: {
          description: 'Calm and affectionate indoor cat',
          microchipId: 'MC987654321',
        },
        medical: {
          allergies: 'None',
          medications: 'None',
          conditions: 'None',
          vetName: 'Dr. Perera',
          vetPhone: '+94 11 876 5432',
        },
        other: {
          favoriteFood: 'Salmon',
          behavior: 'Indoor cat only, shy with strangers',
          specialNeeds: 'Daily grooming required',
        },
      },
      {
        name: 'Charlie',
        type: 'dog',
        breed: 'Labrador',
        age: 5,
        weight: 32,
        gender: 'male',
        color: 'Black',
        dateOfBirth: '2019-08-10',
        photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
        bio: {
          description: 'Loyal and intelligent labrador, great family dog',
          microchipId: 'MC456789123',
        },
        medical: {
          allergies: 'None',
          medications: 'Joint supplements',
          conditions: 'Mild arthritis',
          vetName: 'Dr. Fernando',
          vetPhone: '+94 11 345 6789',
        },
        other: {
          favoriteFood: 'Chicken and rice',
          behavior: 'Calm and obedient',
          specialNeeds: 'Moderate exercise',
        },
      },
      {
        name: 'Bella',
        type: 'dog',
        breed: 'Beagle',
        age: 4,
        weight: 12,
        gender: 'female',
        color: 'Tri-color',
        dateOfBirth: '2020-04-05',
        photoUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop',
        bio: {
          description: 'Energetic beagle with excellent sense of smell',
          microchipId: 'MC789456123',
        },
        medical: {
          allergies: 'Grain allergies',
          medications: 'None',
          conditions: 'None',
          vetName: 'Dr. Silva',
          vetPhone: '+94 11 234 5678',
        },
        other: {
          favoriteFood: 'Grain-free treats',
          behavior: 'Very energetic, loves to sniff around',
          specialNeeds: 'Needs secure fencing',
        },
      },
      {
        name: 'Milo',
        type: 'cat',
        breed: 'Siamese',
        age: 3,
        weight: 5,
        gender: 'male',
        color: 'Seal Point',
        dateOfBirth: '2021-09-12',
        photoUrl: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=400&fit=crop',
        bio: {
          description: 'Vocal and affectionate Siamese cat',
          microchipId: 'MC321654987',
        },
        medical: {
          allergies: 'None',
          medications: 'None',
          conditions: 'None',
          vetName: 'Dr. Perera',
          vetPhone: '+94 11 876 5432',
        },
        other: {
          favoriteFood: 'Tuna',
          behavior: 'Very talkative, loves attention',
          specialNeeds: 'Needs mental stimulation',
        },
      },
      {
        name: 'Rocky',
        type: 'dog',
        breed: 'German Shepherd',
        age: 6,
        weight: 38,
        gender: 'male',
        color: 'Black and Tan',
        dateOfBirth: '2018-11-20',
        photoUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop',
        bio: {
          description: 'Protective and loyal German Shepherd',
        },
        medical: {
          allergies: 'None',
          medications: 'Hip support supplements',
          conditions: 'Hip dysplasia',
          vetName: 'Dr. Fernando',
          vetPhone: '+94 11 345 6789',
        },
        other: {
          favoriteFood: 'Raw meat',
          behavior: 'Protective of family, good guard dog',
          specialNeeds: 'Regular hip checkups',
        },
      },
      {
        name: 'Daisy',
        type: 'cat',
        breed: 'Maine Coon',
        age: 1,
        weight: 6,
        gender: 'female',
        color: 'Brown Tabby',
        dateOfBirth: '2023-05-15',
        photoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
        bio: {
          description: 'Playful and fluffy Maine Coon kitten',
          microchipId: 'MC147258369',
        },
        medical: {
          allergies: 'None',
          medications: 'None',
          conditions: 'None',
          vetName: 'Dr. Perera',
          vetPhone: '+94 11 876 5432',
        },
        other: {
          favoriteFood: 'Kitten formula',
          behavior: 'Very playful and curious',
          specialNeeds: 'Needs plenty of playtime',
        },
      },
      {
        name: 'Cooper',
        type: 'dog',
        breed: 'Poodle',
        age: 2,
        weight: 8,
        gender: 'male',
        color: 'Apricot',
        dateOfBirth: '2022-07-30',
        photoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop',
        bio: {
          description: 'Intelligent and hypoallergenic poodle',
          microchipId: 'MC963852741',
        },
        medical: {
          allergies: 'None',
          medications: 'None',
          conditions: 'None',
          vetName: 'Dr. Silva',
          vetPhone: '+94 11 234 5678',
        },
        other: {
          favoriteFood: 'Duck treats',
          behavior: 'Very smart, learns tricks quickly',
          specialNeeds: 'Regular grooming every 6 weeks',
        },
      },
    ];

    const pets: any[] = [];

    // Create pets with tags
    for (let i = 0; i < comprehensivePets.length; i++) {
      const petData = comprehensivePets[i];
      const owner = users[i % users.length];

      // Some pets will be active (have tags), others inactive
      const isActive = i % 3 !== 0; // 2 out of 3 pets are active

      let tagId = null;

      if (isActive) {
        // Create active tag
        const tag = await Tag.create({
          qrCode: `TAG-2024-${String(i + 1).padStart(3, '0')}`,
          status: 'active', // ✅ Valid enum value
          activatedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
          petId: null,
          userId: owner._id,
        });
        tagId = tag._id;

        // Create pet
        const pet = await Pet.create({
          ...petData,
          dateOfBirth: new Date(petData.dateOfBirth),
          ownerId: owner._id,
          tagId: tag._id,
          status: 'active',
        });

        // Update tag with petId
        tag.petId = pet._id;
        await tag.save();

        pets.push(pet);
      } else {
        // Create pet without tag (inactive)
        const pet = await Pet.create({
          ...petData,
          dateOfBirth: new Date(petData.dateOfBirth),
          ownerId: owner._id,
          tagId: null,
          status: 'inactive',
        });

        pets.push(pet);
      }
    }
    console.log('✅ Comprehensive pets + tags created and linked');

    // Create extra unassigned tags - use 'pending' status instead of 'available'
    const defaultUser = users[0];

    for (let i = 0; i < 5; i++) {
      await Tag.create({
        qrCode: `TAG-2024-${String(100 + i).padStart(3, '0')}`,
        status: 'pending', // ✅ Changed from 'available' to 'pending' (valid enum value)
        petId: null,
        activatedAt: null,
        userId: defaultUser._id,
      });
    }
    console.log('✅ Extra unassigned tags created');

    console.log('🎉 Database seeded successfully!');

    console.log(`\n📋 Summary:
- ${users.length} users created
- ${pets.length} pets created
- ${comprehensivePets.filter((_, i) => i % 3 !== 0).length} active pets with tags
- ${comprehensivePets.filter((_, i) => i % 3 === 0).length} inactive pets without tags
- 5 unassigned tags with 'pending' status

Admin Credentials:
Email: admin@pettag.com
Use Firebase Auth for login

Test User:
Email: user1@example.com
Use Firebase Auth for login\n`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB disconnected");
  }
};

// Run script if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };