const Message = require('../models/Chat'); // Fixed import path
const User = require('../models/user'); // Assuming this is the correct path

const getMessages = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ user: userId }, { recipient: userId }]
    })
      .populate('user', 'fullName')
      .populate('recipient', 'fullName')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages', details: error.message });
  }
};

const saveMessage = async (req, res) => {
  const { userId, text, imageUrl, fileUrl } = req.body;

  const openingHour = 9;
  const closingHour = 23;
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour < openingHour || currentHour >= closingHour) {
    return res.status(400).json({
      error: 'Chat is closed. Please visit the symptom checker.',
      redirectToSymptomChecker: true,
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newMessage = new Message({
      user: user._id,
      username: user.fullName,
      text,
      imageUrl,
      fileUrl
    });

    await newMessage.save();
    
    // Populate user information before sending response
    await newMessage.populate('user', 'fullName');
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error in saveMessage:', error);
    res.status(500).json({ error: 'Failed to save message', details: error.message });
  }
};

const getVetMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('user', 'fullName')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error in getVetMessages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages', details: error.message });
  }
};

module.exports = { getMessages, saveMessage, getVetMessages };
