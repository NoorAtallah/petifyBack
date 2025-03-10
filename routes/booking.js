const express = require('express');
const router = express.Router();
const { createBooking,getMyBookings, getAllBookings, deleteBooking, updateBooking, markBookingAsCompleted  } = require('../controllers/bookingcontroller');
const authenticateUser = require('../middleware/auth');
// POST /api/bookings - Route to create a booking
router.post('/bookings', authenticateUser,  createBooking);
router.get('/my-bookings', authenticateUser, getMyBookings);
router.get('/bookings', getAllBookings);
router.delete('/:id', deleteBooking);

// PUT /api/bookings/:id
router.put('/:id', updateBooking);
router.put('/:id/mark-completed', markBookingAsCompleted);
module.exports = router;
