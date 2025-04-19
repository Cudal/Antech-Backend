require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      // Create admin user
      const admin = new User({
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        email: 'admin@example.com',
        role: 'admin'
      });
      
      await admin.save();
      console.log('Admin user created successfully!');
    } else {
      // Update existing admin password
      adminExists.password = await bcrypt.hash('admin123', 10);
      await adminExists.save();
      console.log('Admin password reset to admin123');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

initAdmin(); 