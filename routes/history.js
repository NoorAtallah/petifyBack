const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/historyController');
const auth = require('../middleware/auth');


// Create new consultation - only accessible by vets
router.post(
  '/create', 
  auth, 
  
  consultationController.createConsultation
);

// Get consultations for the logged-in vet
router.get(
  '/vet-history', 
  auth, 
  
  consultationController.getVetConsultations
);

// Get consultations for the logged-in pet owner
router.get(
  '/pet-owner-history', 
  auth, 
  consultationController.getPetOwnerConsultations
);

module.exports = router;


