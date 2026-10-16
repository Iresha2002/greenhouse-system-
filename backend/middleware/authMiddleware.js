const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User associated with this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

// Role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
