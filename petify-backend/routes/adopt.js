const express = require('express');
const router = express.Router();
const {
  getAllPets,
  createPet,
  getPetById,
  getPetsByType,
  getUserPets,
  updateUserPet,
  deleteUserPet
} = require('../controllers/adoptcontroller');
const authMiddleware = require('../middleware/auth');

router.get('/getpets', getAllPets);
router.post('/postpets', authMiddleware, createPet);
router.get('/getpet/:id', getPetById);
router.get('/getpetbytype', getPetsByType);

// New routes for user's pets
router.get('/user/pets', authMiddleware, getUserPets);
router.put('/user/pets/:id', authMiddleware, updateUserPet);
router.delete('/user/pets/:id', authMiddleware, deleteUserPet);

module.exports = router;