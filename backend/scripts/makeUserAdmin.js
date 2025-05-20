const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://talhaeren:talhaeren@cluster0.86ovh.mongodb.net/futbolx?retryWrites=true&w=majority&appName=Cluster0';

// Function to make talhaeren user an admin
async function makeUserAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection successful');

    // Find talhaeren user
    const user = await User.findOne({ username: 'talhaeren' });
    
    if (!user) {
      console.log('User talhaeren not found! Creating a new admin account.');
      
      // Create a new admin account if user doesn't exist
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('talhaeren', salt);
      
      const newAdmin = new Admin({
        username: 'talhaeren',
        email: 'talhaeren@example.com',
        password: hashedPassword,
        firstName: 'Talha',
        lastName: 'Eren',
        role: 'superadmin',
        permissions: {
          manageUsers: true,
          manageReservations: true,
          manageVenues: true,
          manageContent: true,
          viewReports: true
        }
      });
      
      await newAdmin.save();
      console.log('New admin account created successfully!');
    } else {
      console.log('User talhaeren found:', user.username);
      
      // Check if admin account already exists
      const existingAdmin = await Admin.findOne({ username: 'talhaeren' });
      
      if (existingAdmin) {
        console.log('User already has admin privileges.');
        
        // Update admin permissions to ensure they have full access
        existingAdmin.role = 'superadmin';
        existingAdmin.permissions = {
          manageUsers: true,
          manageReservations: true,
          manageVenues: true,
          manageContent: true,
          viewReports: true
        };
        
        await existingAdmin.save();
        console.log('Admin permissions updated to superadmin with full access.');
      } else {
        // Create admin account linked to the existing user
        const newAdmin = new Admin({
          username: user.username,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'superadmin',
          permissions: {
            manageUsers: true,
            manageReservations: true,
            manageVenues: true,
            manageContent: true,
            viewReports: true
          }
        });
        
        await newAdmin.save();
        console.log('Admin privileges granted to', user.username);
      }
    }
    
    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// Run the function
makeUserAdmin(); 