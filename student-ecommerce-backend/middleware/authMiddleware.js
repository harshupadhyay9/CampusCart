const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("JWT secret key not found in environment variables.");
    }

    const verified = jwt.verify(token, secretKey);

    // Attach full user data including role
    req.user = {
      id: verified.id,
      email: verified.email,
      role: verified.role, // ✅ Include role in user data
    };

    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
