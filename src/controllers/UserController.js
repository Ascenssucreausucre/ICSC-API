const { User, Author, Article, PushSubscription } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const webPush = require("../utils/webPush");

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
      httpOnly: true, // Protect against XSS
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", // Protect against CSRF
      maxAge: 60 * 60 * 1000, // Expire after 1h
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
  const { name, surname, pin } = req.body;
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

    if (pin.length > 0 && pin !== user.author_id) {
      const author = await Author.findByPk(pin);
      const isAuthorLinked = await User.findOne({ where: { author_id: pin } });
      if (!author) {
        return res
          .status(404)
          .json({ error: `No author found with pin ${pin}` });
      }
      if (isAuthorLinked && isAuthorLinked.id !== user.id) {
        console.log(isAuthorLinked);
        return res.status(403).json({
          error: `Author with pin ${pin} is linked to another account. If you think this is an error, please contact the support as soon as possible.`,
        });
      }
    }

    await user.update({
      name:
        typeof name === "string" && name.trim().length > 0 ? name : user.name,
      surname:
        typeof surname === "string" && surname.trim().length > 0
          ? surname
          : user.surname,
      author_id: pin || null,
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

exports.getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId, {
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
    res.status(200).json(user);
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

exports.getAll = async (req, res) => {
  const { limit = 20, page = 1, search } = req.query;
  try {
    const whereClause = {};

    if (search && search.length > 0) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { surname: { [Op.like]: `%${search}%` } },
        { author_id: { [Op.eq]: search } },
      ];
    }

    const includeOptions = [{ model: Author, as: "author" }];

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      where: whereClause,
      include: includeOptions,
      limit: parsedLimit,
      offset,
    });

    const count = await User.count({ where: whereClause });

    return res.status(200).json({ results: users, total: count });
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

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: "No user find with such id.",
      });
    }
    await user.destroy();
    return res.status(200).json({ message: "User succesfully deleted." });
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
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
exports.unlinkAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user.author_id) {
      return res.status(400).json({
        error: "This user has no author to unlink.",
      });
    }
    const userPushSubscriptions = await PushSubscription.findAll({
      where: { userId: user.id },
    });

    if (userPushSubscriptions.length > 0) {
      const payload = {
        title: "Your account is no longer linked to an author.",
        body: `The administration team has decided to unlink the author your account has been linked to, due to a suspicion of impersonating someone else.`,
        tag: `unlinkAuthor_${user.id}`,
      };

      for (const sub of userPushSubscriptions) {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              expirationTime: sub.expirationTime,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(payload)
          );
        } catch (error) {
          console.error(
            `Failed to send push to ${sub.endpoint}: ${error.message}`
          );
          if (error.statusCode === 410 || error.statusCode === 404) {
            await sub.destroy();
          }
        }
      }
    }

    await user.update({ author_id: null });
    res.status(200).json({ message: "Author has been successfully reset." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
