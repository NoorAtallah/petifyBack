const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactcontroller');

router.post('/submit-contact', createContact);

module.exports = router;
