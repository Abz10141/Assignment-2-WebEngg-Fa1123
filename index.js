// index.js
const express = require('express');
const authRoutes = require('./authRoutes');
const blogPostRoutes = require('./blogPostRoutes');
const userInteractionRoutes = require('./userInteractionRoutes');
const adminRoutes = require('./adminRoutes');
const searchRoutes = require('./searchRoutes');

const router = express.Router();

// Use the imported route modules
router.use('/api/auth', authRoutes);
router.use('/api/blog', blogPostRoutes);
router.use('/api/user', userInteractionRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/search', searchRoutes);

module.exports = router;
