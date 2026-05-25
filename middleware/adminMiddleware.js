// ============================================================
// Admin Middleware — restricts access to admin-only routes
// ============================================================

/**
 * isAdmin
 * Must run AFTER isAuthenticated so req.user is already set.
 * Checks that the authenticated user has the 'admin' role.
 * Returns a 403 page if the user is not an admin.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Non-admin user — render a 403 / Access Denied page
  return res.status(403).render('404', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page.',
  });
};

module.exports = isAdmin;
