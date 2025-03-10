const Pet = require('../models/petadopt'); // Assuming your model is saved as petModel.js

// Get all pets (for viewing the adoption section)
exports.getAllPets = async (req, res) => {
  const { page = 1, limit = 6 } = req.query; // Default values: page 1, 6 pets per page
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  try {
    // Fetch pets with pagination
    const pets = await Pet.find()
      .limit(Number(limit))
      .skip(Number(skip));
    
    const totalPets = await Pet.countDocuments(); // Total number of pets in the database
    const totalPages = Math.ceil(totalPets / limit); // Calculate total pages

    res.status(200).json({
      pets,
      currentPage: Number(page),
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
};

// Get pets by type with pagination
exports.getPetsByType = async (req, res) => {
  const { type, page = 1, limit = 6 } = req.query; // Default values for page and limit
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  try {
    // Fetch pets by type with pagination
    const query = type ? { type } : {};
    const pets = await Pet.find(query)
      .limit(Number(limit))
      .skip(Number(skip));

    const totalPets = await Pet.countDocuments(query); // Total pets of the selected type
    const totalPages = Math.ceil(totalPets / limit); // Calculate total pages

    res.status(200).json({
      pets,
      currentPage: Number(page),
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching pets by type:', error);
    res.status(500).json({ message: 'Error fetching pets by type', error: error.message });
  }
};

// Get a pet by ID
exports.getPetById = async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.status(200).json(pet);
  } catch (error) {
    console.error('Error fetching pet by ID:', error);
    res.status(500).json({ message: 'Error fetching pet by ID', error: error.message });
  }
};



// Post a new pet for adoption (with image handling)
exports.createPet = async (req, res) => {
  try {
    console.log('Received pet data:', req.body);
    console.log('User object:', req.user);

    if (!req.user || !req.user.id) {
      console.log('Authentication failed: No valid user object');
      return res.status(401).json({ message: 'Authentication required. Please log in again.' });
    }

    const {
      name,
      breed,
      age,
      gender,
      location,
      vaccinationStatus,
      healthInfo,
      size,
      temperament,
      spayedNeutered,
      goodWithKids,
      goodWithOtherPets,
      adoptionFee,
      contactInfo,
      type,
      description,
      imageUrl
    } = req.body;

    const ageNumber = parseInt(age, 10);
    const adoptionFeeNumber = parseFloat(adoptionFee);

    if (isNaN(ageNumber) || isNaN(adoptionFeeNumber)) {
      console.log('Invalid age or adoption fee:', { age, adoptionFee });
      return res.status(400).json({ message: 'Age and adoption fee must be numbers' });
    }

    if (!name || !gender || !location || !vaccinationStatus || !temperament || spayedNeutered === undefined || !type) {
      console.log('Missing required fields:', { name, gender, location, vaccinationStatus, temperament, spayedNeutered, type });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPet = new Pet({
      name,
      breed,
      age: ageNumber,
      gender,
      location,
      vaccinationStatus,
      healthInfo: healthInfo || '',
      size,
      temperament,
      spayedNeutered,
      goodWithKids: goodWithKids || false,
      goodWithOtherPets: goodWithOtherPets || false,
      adoptionFee: adoptionFeeNumber,
      contactInfo,
      type,
      description: description || '',
      image: imageUrl,
      postedBy: req.user.id
    });

    const validationError = newPet.validateSync();
    if (validationError) {
      console.log('Validation failed:', validationError.errors);
      return res.status(400).json({ message: 'Validation failed', errors: validationError.errors });
    }

    const savedPet = await newPet.save();
    console.log('Pet saved successfully:', savedPet);
    res.status(201).json(savedPet);
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: 'Error creating pet', error: error.message });
  }
};



// Delete a pet by ID
exports.deletePet = async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findByIdAndDelete(id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: 'Error deleting pet', error: error.message });
  }
};

// Update a pet's details by ID
exports.updatePet = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Error updating pet', error: error.message });
  }
};

exports.getUserPets = async (req, res) => {
  try {
    const pets = await Pet.find({ postedBy: req.user.id });
    res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({ message: 'Error fetching user pets', error: error.message });
  }
};

exports.updateUserPet = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const pet = await Pet.findOne({ _id: id, postedBy: req.user.id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found or you do not have permission to edit this pet' });
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json(updatedPet);
  } catch (error) {
    console.error('Error updating user pet:', error);
    res.status(500).json({ message: 'Error updating user pet', error: error.message });
  }
};

exports.deleteUserPet = async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findOne({ _id: id, postedBy: req.user.id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found or you do not have permission to delete this pet' });
    }

    await Pet.findByIdAndDelete(id);
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting user pet:', error);
    res.status(500).json({ message: 'Error deleting user pet', error: error.message });
  }
};