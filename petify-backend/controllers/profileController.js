// controllers/profileController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const Subscription = require('../models/subscription');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Fetch user's subscription
    const subscription = await Subscription.findOne({ user: req.user.id });

    res.json({ user, subscription });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.updateUserProfile = async (req, res) => {
  const { fullName, email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update name and email if provided
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    // If currentPassword and newPassword are provided, handle password change
    if (currentPassword && newPassword) {
      // Check if the current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }

      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};