const { User } = require('../models'); // Adjust path if necessary based on your structure
const bcrypt = require('bcryptjs');

/**
 * @description Create a new user
 * @route POST /api/users
 * @access Public
 */
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
      role,
    });

    // Don't send the password hash back in the response
    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password_hash;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user.' });
  }
};

module.exports = {
  createUser,
};