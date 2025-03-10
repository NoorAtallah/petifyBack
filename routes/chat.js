const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/getmessege', chatController.getMessages);
router.post('/postmessege', chatController.saveMessage);
router.get('/vetmessages', chatController.getVetMessages);
module.exports = router;
