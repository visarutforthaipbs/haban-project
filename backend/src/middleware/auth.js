const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Try to get token from Authorization header
    let token = req.headers.authorization?.split(" ")[1];

    // If no token in header, try to get from cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    // Try to get token from Authorization header
    let token = req.headers.authorization?.split(" ")[1];

    // If no token in header, try to get from cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth,
};
