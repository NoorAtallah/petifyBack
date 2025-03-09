// routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming you have an auth middleware
const { getUserProfile } = require('../controllers/profileController');
const {updateUserProfile } = require('../controllers/profileController');
// Get user profile
router.get('/', auth, getUserProfile);
router.put('/', auth, updateUserProfile);
module.exports = router;
