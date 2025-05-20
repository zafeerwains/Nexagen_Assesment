const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthController = require('../controllers/authController');

const authController = new AuthController(User);
// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

module.exports = router;