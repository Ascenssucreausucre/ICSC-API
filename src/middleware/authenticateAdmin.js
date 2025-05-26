const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ton-secret-de-jwt";

// Middleware générique pour tout admin
const authenticateAdmin = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "superadmin" && decoded.role !== "admin") {
      throw new Error({
        message:
          "Unauthorized. If you are an admin, please log-in with your admin account.",
      });
    }
    req.admin = decoded; // id + role
    next();
  } catch (error) {
    console.error("Error verifying token:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    }

    res.status(401).json({ error: error.message });
  }
};

// Middleware pour superadmin uniquement
const authenticateSuperAdmin = (req, res, next) => {
  authenticateAdmin(req, res, () => {
    if (req.admin?.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden: superadmin only." });
    }
    next();
  });
};

module.exports = {
  authenticateAdmin,
  authenticateSuperAdmin,
};
