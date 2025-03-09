// controllers/adminController.js
const Admin = require('../models/admin');
const User = require('../models/user');
const Subscription = require('../models/subscription');
const Booking = require('../models/booking');
const Contact = require('../models/contactus');
const nodemailer = require("nodemailer");
const VetApplication = require('../models/vet');
const bcrypt = require('bcryptjs');


// Admin login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Admin.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // For simplicity, you may skip password hashing
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // You can return some user info instead of JWT
    res.json({ message: 'Login successful', user: { username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



// Get all users
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({ role: 'user' }).select('-password');
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Get all active and inactive vets
  exports.getAllVets = async (req, res) => {
    try {
      const vets = await User.find({ role: 'vet' }).select('-password');
      res.json(vets);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

  exports.updateActiveStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body; // The new active status
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.isActive = isActive; // Update the active status
      await user.save(); // Save the updated user
  
      res.json({ message: 'User status updated successfully', user });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
// -------------------------------------------------------------------


  exports.getAllSubscriptions = async (req, res) => {
    try {
      // Populate the user field and only include the user's name
      const subscriptions = await Subscription.find().populate('user', 'fullName');
      res.json(subscriptions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Get a specific subscription by ID
  exports.getSubscriptionById = async (req, res) => {
    try {
      const subscription = await Subscription.findById(req.params.id).populate('user');
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      res.json(subscription);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Update subscription status (e.g., activate or deactivate)
  exports.updateSubscriptionStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body; // The new status
  
    try {
      const subscription = await Subscription.findById(id);
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
  
      subscription.isActive = isActive; // Update the status
      await subscription.save();
  
      // Update the user's subscription status
      await User.findByIdAndUpdate(subscription.user, { hasActiveSubscription: isActive });
  
      res.json({ message: 'Subscription status updated successfully', subscription });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  // Get total subscription revenue and transaction count
  exports.getSubscriptionStats = async (req, res) => {
    try {
      // Aggregate total revenue and transaction count
      const totalAmount = await Subscription.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $toDouble: "$amount" } }, // Convert amount to a number
            totalTransactions: { $sum: 1 },
          },
        },
      ]);
  
      console.log('Total Revenue and Transactions:', totalAmount);
  
      const stats = totalAmount[0] || { totalRevenue: 0, totalTransactions: 0 };
  
      res.json({
        totalRevenue: stats.totalRevenue,
        totalTransactions: stats.totalTransactions,
      });
    } catch (err) {
      console.error('Error aggregating subscription stats:', err);
      res.status(500).send('Server error');
    }
  };
  
  
  exports.checkSubscriptionStatus = async (req, res) => {
    const { userId } = req.params;
    console.log('Received userId:', userId);  // Log userId
       
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const subscription = await Subscription.findOne({ user: userId }).sort({ createdAt: -1 });
      
      if (subscription) {
        res.send({ 
          isSubscribed: user.hasActiveSubscription, 
          plan: subscription.plan, 
          subscriptionId: subscription._id,
          isActive: subscription.isActive
        });
      } else {
        res.send({ isSubscribed: false });
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
      res.status(500).send({ success: false, message: 'Failed to check subscription status' });
    }
  };
  // Delete a subscription
  exports.deleteSubscription = async (req, res) => {
    try {
      const subscription = await Subscription.findById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
  
      await subscription.remove();
      res.json({ message: 'Subscription deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


  exports.getAllBookings = async (req, res) => {
    try {
      const bookings = await Booking.find().populate('user', 'fullName email');
      res.json(bookings);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  exports.getBookingById = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id).populate('user', 'fullName email');
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(booking);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  exports.updateBooking = async (req, res) => {
    const { date, timeSlot, status } = req.body;
  
    try {
      let booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      booking.date = date || booking.date;
      booking.timeSlot = timeSlot || booking.timeSlot;
      booking.status = status || booking.status;
  
      await booking.save();
      res.json({ message: 'Booking updated successfully', booking });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  // Delete a booking
  exports.deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      await Booking.findByIdAndDelete(req.params.id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


  exports.getAllContactMessages = async (req, res) => {
    try {
      const contacts = await Contact.find();
      res.json(contacts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


 

  exports.respondMessage = async (req, res) => {
    const { messageId } = req.params;
    const { response } = req.body;
  
    try {
      // Find the user's contact message in the database by ID
      const message = await Contact.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      // Send the email response using Nodemailer
      let transporter = nodemailer.createTransport({
        service: 'Gmail', // You can use other services like Outlook, etc.
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS, // Your email password or app-specific password
        },
      });
  
      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: message.email, // The user's email from the contact message
        subject: "Response to Your Inquiry",
        text: response, // The admin's response
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: "Failed to send email", error });
        }
        res.status(200).json({ message: "Response sent via email successfully" });
      });
  
    } catch (error) {
      console.error("Error responding to message:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

  exports.getAllVetApplications = async (req, res) => {
    try {
      const applications = await VetApplication.find().sort({ submittedAt: -1 });
      res.json(applications);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Get a specific vet application by ID
  exports.getVetApplicationById = async (req, res) => {
    try {
      const application = await VetApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Vet application not found' });
      }
      res.json(application);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Approve a vet application
  exports.approveVetApplication = async (req, res) => {
    try {
      const application = await VetApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Vet application not found' });
      }
  
      if (application.approved) {
        return res.status(400).json({ message: 'Application already approved' });
      }
  
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);
  
      // Create a new user account for the vet
      const newUser = new User({
        fullName: application.fullName,
        email: application.email,
        password: hashedPassword,
        role: 'vet',
        isActive: true,
      });
  
      await newUser.save();
  
      // Update the application status
      application.approved = true;
      await application.save();
  
      // Send email with login credentials
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: application.email,
        subject: 'Vet Application Approved - Login Details',
        text: `Dear ${application.fullName},
  
  Your vet application has been approved! You can now log in to your account using the following credentials:
  
  Email: ${application.email}
  Temporary Password: ${tempPassword}
  
  Please change your password after logging in.
  
  Best regards,
  Petify Team`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Vet application approved and account created' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Reject a vet application
  exports.rejectVetApplication = async (req, res) => {
    try {
      const application = await VetApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: 'Vet application not found' });
      }
  
      await VetApplication.findByIdAndDelete(req.params.id);
  
      // Send rejection email
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: application.email,
        subject: 'Vet Application Status',
        text: `Dear ${application.fullName},
  
  We regret to inform you that your application for the vet position has not been successful at this time. We appreciate your interest in joining our team.
  
  Best regards,
  Petify Team`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Vet application rejected and removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };