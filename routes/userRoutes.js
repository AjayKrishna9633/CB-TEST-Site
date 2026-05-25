// ============================================================
// User Routes — dashboard & address CRUD
// All routes are protected by isAuthenticated middleware.
// ============================================================

const express         = require('express');
const router          = express.Router();
const Address         = require('../models/Address');
const isAuthenticated = require('../middleware/authMiddleware');

// Apply auth middleware to every route in this router
router.use(isAuthenticated);

// ----------------------------------------------------------
// GET /dashboard — user's main dashboard with their addresses
// ----------------------------------------------------------
router.get('/dashboard', async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('user/dashboard', {
      title: 'Dashboard',
      addresses,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    req.flash('error_msg', 'Could not load dashboard');
    res.redirect('/');
  }
});

// ----------------------------------------------------------
// GET /address/add — render the add-address form
// ----------------------------------------------------------
router.get('/address/add', (req, res) => {
  res.render('user/addAddress', { title: 'Add Address' });
});

// ----------------------------------------------------------
// POST /address/add — create a new address for the user
// ----------------------------------------------------------
router.post('/address/add', async (req, res) => {
  try {
    const { label, street, city, state, zip, country } = req.body;

    await Address.create({
      user: req.user._id,
      label:   label || 'Home',
      street,
      city,
      state,
      zip,
      country: country || 'India',
    });

    req.flash('success_msg', 'Address added successfully');
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Add address error:', err.message);
    req.flash('error_msg', 'Could not add address. Please check your input.');
    return res.redirect('/address/add');
  }
});

// ----------------------------------------------------------
// GET /address/edit/:id — render the edit-address form
// ----------------------------------------------------------
router.get('/address/edit/:id', async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    // Ensure the address exists and belongs to the logged-in user
    if (!address || address.user.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Address not found');
      return res.redirect('/dashboard');
    }

    res.render('user/editAddress', { title: 'Edit Address', address });
  } catch (err) {
    console.error('Edit address form error:', err.message);
    req.flash('error_msg', 'Could not load address');
    return res.redirect('/dashboard');
  }
});

// ----------------------------------------------------------
// POST /address/edit/:id — update an existing address
// ----------------------------------------------------------
router.post('/address/edit/:id', async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    // Ownership check
    if (!address || address.user.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Address not found');
      return res.redirect('/dashboard');
    }

    // Update fields from the form
    const { label, street, city, state, zip, country } = req.body;
    address.label   = label   || address.label;
    address.street  = street  || address.street;
    address.city    = city    || address.city;
    address.state   = state   || address.state;
    address.zip     = zip     || address.zip;
    address.country = country || address.country;

    await address.save();

    req.flash('success_msg', 'Address updated successfully');
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Update address error:', err.message);
    req.flash('error_msg', 'Could not update address');
    return res.redirect('/dashboard');
  }
});

// ----------------------------------------------------------
// POST /address/delete/:id — delete an address
// ----------------------------------------------------------
router.post('/address/delete/:id', async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    // Ownership check
    if (!address || address.user.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Address not found');
      return res.redirect('/dashboard');
    }

    await Address.findByIdAndDelete(req.params.id);

    req.flash('success_msg', 'Address deleted successfully');
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Delete address error:', err.message);
    req.flash('error_msg', 'Could not delete address');
    return res.redirect('/dashboard');
  }
});

module.exports = router;
