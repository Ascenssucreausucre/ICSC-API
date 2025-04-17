const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "ton-secret-de-jwt";

/**
 * Connexion d'un administrateur
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Générer un JWT
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // 🔥 Envoyer le token dans un cookie HttpOnly
    res.cookie("token", token, {
      httpOnly: true, // Protège contre XSS
      secure: process.env.NODE_ENV === "production", // En prod, le cookie ne sera envoyé qu'en HTTPS
      sameSite: "Strict", // Protège contre CSRF
      maxAge: 60 * 60 * 1000, // Expire après 1 heure
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Déconnexion d'un administrateur
 */
exports.logout = async (req, res) => {
  res.clearCookie("token"); // Supprime le cookie
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * Vérifier si un admin est toujours connecté
 */
exports.checkAuth = async (req, res) => {
  if (req.cookies?.token) {
    return res.status(200).json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
};
