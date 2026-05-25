// ============================================================
// Authentication Middleware — ensures the user is logged in
// ============================================================

const User = require('../models/User');

/**
 * isAuthenticated
 * Checks for an active session (req.session.userId).
 * If present, loads the full User document and attaches it to
 * req.user and res.locals.currentUser so downstream handlers
 * and views can access the authenticated user.
 */
const isAuthenticated = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);

      if (!user) {
        // Session references a user that no longer exists
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error during invalid auth check:', err.message);
          }
          res.clearCookie('connect.sid');
          req.flash('error_msg', 'Please log in to continue');
          return res.redirect('/login');
        });
        return;
      }

      req.user = user;
      res.locals.currentUser = user;
      return next();
    }

    // No session — redirect to login
    req.flash('error_msg', 'Please log in to continue');
    return res.redirect('/login');
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    req.flash('error_msg', 'An error occurred. Please log in again.');
    return res.redirect('/login');
  }
};

module.exports = isAuthenticated;
