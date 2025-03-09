const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/subscriptionController');

// Route to handle subscription
router.post('/subscribe', subscribe);

module.exports = router;
