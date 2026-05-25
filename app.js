// ============================================================
// app.js — Main entry point for the User Management App
// ============================================================

require('dotenv').config();

const express        = require('express');
const path           = require('path');
const session        = require('express-session');
const flash          = require('connect-flash');
const methodOverride = require('method-override');

// Mongoose models
const User = require('./models/User');

// Route modules
const authRoutes  = require('./routes/authRoutes');
const userRoutes  = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ----------------------------------------------------------
// Initialize Express
// ----------------------------------------------------------
const app  = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------
// View engine setup — EJS
// ----------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----------------------------------------------------------
// Core middleware
// ----------------------------------------------------------

// Serve static files (CSS, JS, images) from /public
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded form bodies
app.use(express.urlencoded({ extended: true }));

// Allow PUT/DELETE via _method query parameter in forms
app.use(methodOverride('_method'));

// ----------------------------------------------------------
// Session configuration — using in-memory store
// ----------------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// ----------------------------------------------------------
// Flash messages
// ----------------------------------------------------------
app.use(flash());

// ----------------------------------------------------------
// Global middleware — expose flash messages & currentUser
// to ALL views via res.locals so EJS templates can use them
// without each route handler having to pass them explicitly.
// ----------------------------------------------------------
app.use(async (req, res, next) => {
  // Flash messages
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg   = req.flash('error_msg');

  // Expose the currently logged-in user (if any) to every view
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        delete req.session.userId;
      }
      res.locals.currentUser = user;
    } catch (err) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }

  next();
});

// ----------------------------------------------------------
// Routes
// ----------------------------------------------------------

// Landing page
app.get('/', (req, res) => {
  res.render('landing', { title: 'Welcome' });
});

// Auth routes — /login, /register, /logout
app.use('/', authRoutes);

// User routes — /dashboard, /address/*
app.use('/', userRoutes);

// Admin routes — /admin/*
app.use('/admin', adminRoutes);

// ----------------------------------------------------------
// 404 catch-all — must be the LAST route
// ----------------------------------------------------------
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
  });
});

// ----------------------------------------------------------
// Start the server
// ----------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
