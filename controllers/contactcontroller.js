const Contact = require('../models/contactus');

exports.createContact = async (req, res) => {
  try {
    const { name, email, phoneNo, city, message } = req.body;  // Include message

    const newContact = new Contact({
      name,
      email,
      phoneNo,
      city,
      message,  // Add message
    });

    await newContact.save();
    
    res.status(201).json({
      success: true,
      message: 'Contact information submitted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
