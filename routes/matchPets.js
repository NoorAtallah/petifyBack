const express = require('express');
const Pet = require('../models/petadopt'); // Import your Pet model
const router = express.Router();

router.post('/match', async (req, res) => {
  const { size, temperament, goodWithKids, goodWithOtherPets, type, gender } = req.body;

  try {
    const query = {
      ...(size && { size }),
      ...(temperament && { temperament }),
      ...(goodWithKids && { goodWithKids: true }),
      ...(goodWithOtherPets && { goodWithOtherPets: true }),
      ...(type && { type }), 
      ...(gender && { gender }), 
    };

    const matchedPets = await Pet.find(query);
    res.json(matchedPets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
