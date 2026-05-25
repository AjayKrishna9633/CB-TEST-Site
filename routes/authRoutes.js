// ============================================================
// Auth Routes — register, login, logout
// ============================================================

const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// ----------------------------------------------------------
// GET /register — show registration form
// ----------------------------------------------------------
router.get('/register', (req, res) => {
  // If the user is already logged in, skip the form
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { title: 'Register' });
});

// ----------------------------------------------------------
// POST /register — create a new user account
// ----------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // --- Validation ---
    if (!name || !email || !password || !confirmPassword) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters');
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/register');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash('error_msg', 'Email is already registered');
      return res.redirect('/register');
    }

    // Create the user (password is hashed by the pre-save hook)
    const user = await User.create({ name, email, password });

    // Log them in immediately
    req.session.userId = user._id;
    req.flash('success_msg', 'Registration successful! Welcome aboard.');
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err.message);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    return res.redirect('/register');
  }
});

// ----------------------------------------------------------
// GET /login — show login form
// ----------------------------------------------------------
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Login' });
});

// ----------------------------------------------------------
// POST /login — authenticate user credentials
// ----------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Please provide email and password');
      return res.redirect('/login');
    }

    // Look up user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Compare submitted password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Establish session
    req.session.userId = user._id;
    req.flash('success_msg', `Welcome back, ${user.name}!`);

    // Redirect admins to the admin dashboard
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err.message);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    return res.redirect('/login');
  }
});

// ----------------------------------------------------------
// GET /logout — destroy session and redirect to landing page
// ----------------------------------------------------------
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
    }
    res.redirect('/');
  });
});

module.exports = router;
