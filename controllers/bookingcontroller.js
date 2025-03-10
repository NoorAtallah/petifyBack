const nodemailer = require('nodemailer');
const Booking = require('../models/booking');

// Simulate creating a Zoom link with an existing passcode from the invitation
const generateZoomLink = () => {
  const zoomLink = 'https://us02web.zoom.us/j/7491016618'; // Your actual Zoom meeting link
  const passcode = 'qRHyy1'; // Passcode from your Zoom invitation
  return { zoomLink, passcode };
};

// POST /api/bookings
const createBooking = async (req, res) => {
  const { username, email, date, timeSlot } = req.body;

  // Get Zoom link and passcode from your Zoom invitation
  const { zoomLink, passcode } = generateZoomLink();

  try {
    // Retrieve user from token (this assumes you have middleware to decode the token)
    const userId = req.user.id; // Assuming `req.user` contains the logged-in user

    // Check if the session with the same date and time slot is already booked
    const existingBooking = await Booking.findOne({ date, timeSlot });

    if (existingBooking) {
      // If a booking for the same date and timeSlot already exists, send an error response
      return res.status(400).json({ error: 'This session is already booked. Please choose another time slot.' });
    }

    // Save booking details to the database
    const newBooking = new Booking({
      username,
      email,
      date,
      timeSlot,
      zoomLink,
      user: userId, // Associate booking with the logged-in user
    });

    await newBooking.save(); // Save to MongoDB before sending the email

    // Send email with booking confirmation, Zoom link, and passcode
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: 'nm696014@gmail.com',
      to: email,
      subject: 'Booking Confirmation',
      text: `Hello ${username},\n\nYour booking has been confirmed for ${date} at ${timeSlot}. Here is your Zoom link: ${zoomLink}\n\nPasscode: ${passcode}\n\nThanks,\nPetify Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        return res.status(200).json({ success: true, message: 'Booking confirmed. Email sent!' });
      }
    });
  } catch (error) {
    console.error('Error saving booking:', error);
    return res.status(500).json({ error: 'Failed to save booking' });
  }
};

// GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};




const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find(); // Retrieve all bookings
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};


const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: 'Failed to delete booking' });
  }
};

// PUT /api/bookings/:id
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { date, timeSlot } = req.body;
    
    // Check if the new time slot is available
    const existingBooking = await Booking.findOne({ 
      date, 
      timeSlot, 
      _id: { $ne: bookingId } // Exclude the current booking from the check
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked. Please choose another.' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId, 
      { date, timeSlot },
      { new: true } // Return the updated document
    );
    
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    return res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
};

const markBookingAsCompleted = async (req, res) => {
  try {
    const bookingId = req.params.id;

    console.log(`Attempting to mark booking ${bookingId} as completed`);

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "Completed", completed: true },
      { new: true }
    );

    if (!updatedBooking) {
      console.log(`Booking ${bookingId} not found`);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log(`Booking ${bookingId} marked as completed:`, updatedBooking);
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error marking booking as completed:', error);
    res.status(500).json({ message: 'Error marking booking as completed', error: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, deleteBooking, updateBooking, markBookingAsCompleted };





