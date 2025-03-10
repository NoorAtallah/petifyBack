const Subscription = require('../models/subscription');

// Controller to handle subscription
exports.subscribe = async (req, res) => {
  const { plan, user } = req.body;

  if (!plan || !user) {
    return res.status(400).json({ success: false, message: 'Plan type and user info are required.' });
  }

  try {
    // Save subscription details to the database
    const newSubscription = new Subscription({
      user: user._id, // Use user ID or other identifier
      plan,
      createdAt: new Date()
    });
    await newSubscription.save();

    // Respond with success
    res.json({ success: true, message: 'Subscription successful.' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
