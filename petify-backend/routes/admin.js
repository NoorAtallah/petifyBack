const express = require('express');
const { login } = require('../controllers/admincontroller');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const subscriptionController = require('../controllers/admincontroller'); // Import subscription controller
const authMiddleware = require('../middleware/auth');

// Admin login route
router.post('/login', login);

// Get all users (excluding vets)
router.get('/users', adminController.getAllUsers);

// Get all vets
router.get('/vets', adminController.getAllVets);

// Update the active status of a user or vet
router.patch('/users/:id', adminController.updateActiveStatus);

// Subscription management routes
// Get all subscriptions
router.get('/subscriptions', subscriptionController.getAllSubscriptions);

// Get a specific subscription by ID
router.get('/subscriptions/:id', subscriptionController.getSubscriptionById);

// Update subscription status (e.g., activate/deactivate or cancel subscription)
router.patch('/subscriptions/:id', subscriptionController.updateSubscriptionStatus);

// Delete a subscription
router.delete('/subscriptions/:id', subscriptionController.deleteSubscription);
router.get('/subscription-stats', subscriptionController.getSubscriptionStats);
router.delete('/subscriptions/subscription-stats', subscriptionController.getSubscriptionStats);



router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.put('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);

router.get('/contacts', adminController.getAllContactMessages);

// Respond to a contact message
router.post('/contacts/:messageId/respond', adminController.respondMessage);

router.get('/vet-applications',  adminController.getAllVetApplications);
router.get('/vet-applications/:id',  adminController.getVetApplicationById);
router.post('/vet-applications/:id/approve', adminController.approveVetApplication);
router.post('/vet-applications/:id/reject',  adminController.rejectVetApplication);


module.exports = router;
