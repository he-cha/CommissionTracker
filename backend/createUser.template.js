const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Replace these values with your desired credentials
    const username = 'your_username_here';
    const password = 'your_password_here';

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    const user = new User({
      username: username,
      password: hashedPassword,
      role: 'admin'
    });

    await user.save();
    console.log('User created successfully!');
    console.log('Username:', username);
    console.log('Password:', password);

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createUser();