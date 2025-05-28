const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ton-secret-de-jwt";

exports.authenticateAny = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // On place les infos du token dans req.user
    req.user = {
      id: decoded.id,
      role: decoded.role || "user", // par défaut, on suppose que c'est un user
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    }

    res.status(401).json({ error: "Session expired." });
  }
};
