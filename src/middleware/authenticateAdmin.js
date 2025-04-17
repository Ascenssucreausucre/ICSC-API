const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ton-secret-de-jwt";

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies?.token; // 🔥 Récupère le token depuis les cookies

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Vérifier le token
    req.admin = decoded; // Ajouter l'admin à la requête
    next();
  } catch (error) {
    console.error("Error verifying token:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    }

    res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = authenticateAdmin;
