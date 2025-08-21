const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Budget_Tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    budgetLimit: 5000,
    isEmailVerified: true
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    budgetLimit: 3000,
    isEmailVerified: true
  },
  {
    firstName: 'Cameron',
    lastName: 'Williamson',
    email: 'test@gmail.com',
    password: 'password123',
    budgetLimit: 10000,
    isEmailVerified: false
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert seed users
    const createdUsers = await User.insertMany(seedUsers);
    console.log(`Created ${createdUsers.length} users:`);
    
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
    });

    console.log('\nDatabase seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Email: test@gmail.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
