const express = require('express');
const router = express.Router();
const { generateToken, processPayment, checkSubscriptionStatus } = require('../controllers/braintreecontroller');

router.get('/braintree/getToken', generateToken);
router.post('/braintree/processPayment', processPayment);
router.get('/subscriptions/:userId/status', checkSubscriptionStatus);
module.exports = router;
