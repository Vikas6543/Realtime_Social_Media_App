const jwt = require('jsonwebtoken');

// check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  const token = req.header('authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized...' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: 'Invalid Token...' });
  }
};

// role based authentication
const checkRole = (roles) => async (req, res, next) => {
  if (!roles.includes(req?.user?.role)) {
    return res
      .status(403)
      .json({ message: 'You are unauthorized to access this resource...' });
  }
  next();
};

module.exports = { isAuthenticated, checkRole };
