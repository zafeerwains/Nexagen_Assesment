const express = require('express');
const router = express.Router();
// const User = require('../models/User');
const AuthController = require('../controllers/authController');
const User = require('../models/User');

const authController = new AuthController(User);
// Register route
router.post('/register', authController.register.bind(authController));

// Login route
router.post('/login', authController.login.bind(authController));

module.exports = router;