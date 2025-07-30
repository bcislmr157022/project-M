const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');  // Updated to use the centralized models
require('dotenv').config();

// Enhanced signup with validation
router.post('/signup', async (req, res) => {
  try {
    const { user_name, user_email, user_password, user_role = 'nurse' } = req.body;

    // Validation
    if (!user_email || !user_password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const existingUser = await db.User.findOne({ 
      where: { user_email },
      attributes: ['user_id'] 
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: "Email already registered",
        code: "EMAIL_EXISTS"
      });
    }

    // Create user with hashed password
    const user = await db.User.create({
      user_name,
      user_email,
      user_password_hash: await bcrypt.hash(user_password, 12), // Increased salt rounds
      user_role,
      user_is_active: true
    });

    // Generate JWT token with more claims
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_role: user.user_role,
        iss: 'birth-monitoring-system'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '12h', // Shorter expiration for security
        algorithm: 'HS256' 
      }
    );

    // Omit password hash from response
    const userResponse = {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_role: user.user_role
    };

    res.status(201).json({ 
      token,
      user: userResponse,
      expires_in: 12 * 60 * 60 // 12 hours in seconds
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: "Registration failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced login with security improvements
router.post('/login', async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    // Basic validation
    if (!user_email || !user_password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user with security considerations
    const user = await db.User.findOne({
      where: { user_email },
      attributes: ['user_id', 'user_email', 'user_password_hash', 'user_role', 'user_is_active']
    });

    if (!user || !user.user_is_active) {
      // Generic message to avoid revealing if account exists
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare passwords with timing-safe comparison
    const passwordValid = await bcrypt.compare(user_password, user.user_password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_email: user.user_email,
        user_role: user.user_role,
        iss: 'birth-monitoring-system'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '12h',
        algorithm: 'HS256'
      }
    );

    // Prepare user data for response
    const userData = {
      user_id: user.user_id,
      user_email: user.user_email,
      user_role: user.user_role
    };

    res.json({
      token,
      user: userData,
      expires_in: 12 * 60 * 60
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: "Authentication failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;