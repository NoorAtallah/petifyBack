const express = require('express');
const router = express.Router();
const { checkSymptoms, getDiagnosis, getSymptomsByPetType} = require('../controllers/symptomcontroller');

// POST route to check symptoms
router.post('/check-symptoms', checkSymptoms);
router.post('/get-diagnosis', getDiagnosis);
router.get('/symptoms/:petType', getSymptomsByPetType);
module.exports = router;
