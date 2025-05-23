const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

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

exports.createAdmin = async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient rights." });
    }

    const { email, password } = req.body;

    const creatorId = req.admin.id;

    if (!creatorId) {
      return res.status(401).json({ error: "No creator retreived." });
    }

    const creator = await Admin.findByPk(creatorId);

    if (!creator) {
      return res.status(404).json({
        error: "No admin found while trying to assimilate the creator.",
      });
    }

    const encodedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      email,
      password: encodedPassword,
      createdBy: creator.id,
    });

    res.status(201).json({ message: "New admin created." });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient rights." });
    }

    const admin = await Admin.findByPk(id);

    if (admin.role === "superadmin") {
      return res.status(403).json({ error: "Superadmin can't be deleted." });
    }

    await admin.destroy();

    res.status(201).json({ message: "Admin deleted." });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

exports.getCurrentAdmin = (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ id: decoded.id, role: decoded.role });
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      include: [{ model: Admin, as: "creator" }],
    });
    return res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
