const { User, Author, Article } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { email, password, name, surname, author_pin } = req.body;

  try {
    const encodedPassword = await bcrypt.hash(password, 12);

    const verifyUser = await User.findOne({
      where: { email },
    });

    if (verifyUser) {
      return res.status(401).json({
        error: "E-mail already in use.",
      });
    }

    if (author_pin) {
      const verifyAuthor = await Author.findByPk(author_pin);

      if (!verifyAuthor) {
        return res.status(401).json({
          error: "No author found whith such pin.",
        });
      }

      const verifyUserPin = await User.findOne({
        where: { author_id: author_pin },
      });

      if (verifyUserPin) {
        return res.status(401).json({
          error:
            "An account is already associated with this author. If you are the author and did not request this, please contact support immediately.",
        });
      }
    }

    const newUser = await User.create({
      email,
      password: encodedPassword,
      name,
      surname,
      author_id: author_pin || null,
    });

    res.status(201).json({
      message: `Welcome to ICSC ${newUser.name} ! Log-in to `,
      id: newUser.id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

exports.logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Incorrect email or password.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: "Incorrect email or password.",
      });
    }

    const token = jwt.sign({ id: user.id, role: "user" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true, // Protège contre XSS
      secure: process.env.NODE_ENV === "production", // En prod, le cookie ne sera envoyé qu'en HTTPS
      sameSite: "Strict", // Protège contre CSRF
      maxAge: 60 * 60 * 1000, // Expire après 1 heure
    });

    res.status(200).json({
      message: `Login successful!`,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  const { name, surname } = req.body;
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: "No token provided. Try logging-in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await user.update({
      name:
        typeof name === "string" && name.trim().length > 0 ? name : user.name,
      surname:
        typeof surname === "string" && surname.trim().length > 0
          ? surname
          : user.surname,
    });

    res.json({ message: "User updated successfully.", user });
  } catch (error) {
    console.error(error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    }

    res.status(500).json({ error: error.message });
  }
};
exports.getProfile = async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: "No token provided. Try logging-in again.",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.role !== "user") {
      return res.status(400).json({
        error:
          "You can't be connected both admin and user on this website. Please disconnect from the dashboard in order to log-in in the public part of the website.",
      });
    }
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: {
        model: Author,
        as: "author",
        include: {
          model: Article,
          as: "articles",
          include: {
            model: Author,
            as: "authors",
          },
        },
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error(error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    }
    res.status(500).json({ error: error.message });
  }
};
exports.delete = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: "No token provided. Try logging-in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.id !== id ||
      decoded.role !== "admin" ||
      decoded.role !== "superadmin"
    ) {
      return res.status(403).json({
        error: "You are not authorized to delete this user.",
      });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: "No user find with such id.",
      });
    }
    await user.destroy();
  } catch (error) {
    console.error(error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please log in again.",
        expiredAt: error.expiredAt,
      });
    }
    res.status(500).json({ error: error.message });
  }
};
exports.logOut = async (req, res) => {
  res.clearCookie("token"); // Supprime le cookie
  res.status(200).json({ message: "Logged out successfully" });
};
