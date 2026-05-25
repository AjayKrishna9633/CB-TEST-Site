// ============================================================
// Admin Routes — user management for administrators
// All routes are protected by isAuthenticated + isAdmin.
// ============================================================

const express         = require('express');
const router          = express.Router();
const User            = require('../models/User');
const Address         = require('../models/Address');
const isAuthenticated = require('../middleware/authMiddleware');
const isAdmin         = require('../middleware/adminMiddleware');

// Apply both middleware to every route in this router
router.use(isAuthenticated, isAdmin);

// ----------------------------------------------------------
// GET /admin — admin dashboard listing all users
// Supports optional ?search= query to filter by name/email.
// ----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    let filter = {};

    if (searchQuery) {
      // Case-insensitive partial match on name or email
      const regex = new RegExp(searchQuery, 'i');
      filter = {
        $or: [{ name: regex }, { email: regex }],
      };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      users,
      search: searchQuery, // pass back so the view can pre-fill the search box
    });
  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    req.flash('error_msg', 'Could not load admin dashboard');
    return res.redirect('/');
  }
});

// ----------------------------------------------------------
// GET /admin/user/:id — view a single user's details + addresses
// ----------------------------------------------------------
router.get('/user/:id', async (req, res) => {
  try {
    const viewedUser = await User.findById(req.params.id);
    if (!viewedUser) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin');
    }

    const addresses = await Address.find({ user: viewedUser._id }).sort({ createdAt: -1 });

    res.render('admin/viewUser', {
      title: 'User Details',
      user: viewedUser,
      addresses,
    });
  } catch (err) {
    console.error('View user error:', err.message);
    req.flash('error_msg', 'Could not load user details');
    return res.redirect('/admin');
  }
});

// ----------------------------------------------------------
// GET /admin/user/:id/edit — render the edit-user form
// ----------------------------------------------------------
router.get('/user/:id/edit', async (req, res) => {
  try {
    const editedUser = await User.findById(req.params.id);
    if (!editedUser) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin');
    }

    res.render('admin/editUser', {
      title: 'Edit User',
      user: editedUser,
    });
  } catch (err) {
    console.error('Edit user form error:', err.message);
    req.flash('error_msg', 'Could not load user edit form');
    return res.redirect('/admin');
  }
});

// ----------------------------------------------------------
// POST /admin/user/:id/edit — update a user's profile
// ----------------------------------------------------------
router.post('/user/:id/edit', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin');
    }

    user.name  = name  || user.name;
    user.email = email || user.email;
    user.role  = role  || user.role;

    await user.save();

    req.flash('success_msg', 'User updated successfully');
    return res.redirect('/admin');
  } catch (err) {
    console.error('Update user error:', err.message);
    req.flash('error_msg', 'Could not update user');
    return res.redirect('/admin');
  }
});

// ----------------------------------------------------------
// POST /admin/user/:id/delete — delete a user + all their
// addresses. Admins cannot delete themselves.
// ----------------------------------------------------------
router.post('/user/:id/delete', async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      req.flash('error_msg', 'You cannot delete your own account');
      return res.redirect('/admin');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin');
    }

    // Remove all addresses belonging to this user first
    await Address.deleteMany({ user: user._id });

    // Then remove the user
    await User.findByIdAndDelete(req.params.id);

    req.flash('success_msg', 'User and their addresses deleted successfully');
    return res.redirect('/admin');
  } catch (err) {
    console.error('Delete user error:', err.message);
    req.flash('error_msg', 'Could not delete user');
    return res.redirect('/admin');
  }
});

module.exports = router;
