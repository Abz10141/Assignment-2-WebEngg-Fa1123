// authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model
const authMiddleware = require('../middleware/authMiddleware');
const Post = require('../models/Post'); // Import the Post model

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/auth/users/:userId
router.get('/users/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if the authenticated user is requesting their own profile
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Retrieve user profile data
    const user = await User.findById(req.params.userId).select('-password'); // Exclude the password field
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/auth/admin/users
router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    // Check if the authenticated user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Retrieve all users (excluding the password field)
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/auth/users/:userId
router.put('/users/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if the authenticated user is updating their own profile
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Update user profile data
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
