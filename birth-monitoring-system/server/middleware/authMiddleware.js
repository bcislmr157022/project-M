const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ 
      error: 'Authorization token required',
      code: 'MISSING_TOKEN'
    });
  }
};

module.exports = { authenticateJWT };