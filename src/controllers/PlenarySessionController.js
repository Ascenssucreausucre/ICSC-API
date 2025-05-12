const { Author, PlenarySession } = require("../models");
const path = require("path");
const fsp = require("fs").promises;

exports.create = async (req, res) => {
  const folder = req.uploadFolder || "plenary-images";
  const image = req.file ? `${folder}/${req.file.filename}` : null;
  const transaction = await PlenarySession.sequelize.transaction();

  try {
    let { authors, id, ...data } = req.body;
    let authorIds = [];

    if (typeof authors === "string") {
      authors = JSON.parse(authors);
    }

    if (Array.isArray(authors)) {
      authorIds = authors.map((a) => a.id ?? a);
    } else if (authors?.id) {
      authorIds = [authors.id];
    }

    const plenary = await PlenarySession.create(
      { ...data, image },
      { transaction }
    );

    if (!plenary) {
      if (image) {
        await fsp.unlink(
          path.join("public/uploads", folder, req.file.filename)
        );
      }
      await transaction.rollback();
      return res.status(500).json({ error: "Error during creation." });
    }

    if (authorIds.length > 0) {
      await plenary.setAuthors(authorIds, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Plenary session successfully created.",
      newItem: { plenary, authors },
    });
  } catch (error) {
    await transaction.rollback();

    if (req.file) {
      try {
        await fsp.unlink(
          path.join("public/uploads", folder, req.file.filename)
        );
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    console.error("Internal server error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

exports.update = async (req, res) => {
  const transaction = await PlenarySession.sequelize.transaction();
  const folder = req.uploadFolder || "plenary-images";

  try {
    const { id } = req.params;
    let { authors, ...data } = req.body;

    if (typeof authors === "string") {
      authors = JSON.parse(authors);
    }

    const updatedSession = await PlenarySession.findByPk(id, {
      include: { model: Author, as: "authors" },
      transaction,
    });

    if (!updatedSession) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "No plenary session found with id " + id });
    }

    let newImage = updatedSession.image;

    if (req.file) {
      const oldImagePath = path.join(
        "public/uploads",
        updatedSession.image || ""
      );

      try {
        await fsp.unlink(oldImagePath);
      } catch (err) {
        console.warn("Old image missing or already deleted:", err.message);
      }

      newImage = `${folder}/${req.file.filename}`;
    }

    await updatedSession.update({ ...data, image: newImage }, { transaction });

    let authorIds = [];
    if (Array.isArray(authors)) {
      authorIds = authors.map((a) => a.id ?? a);
    } else if (authors?.id) {
      authorIds = [authors.id];
    }

    if (authorIds.length > 0) {
      await updatedSession.setAuthors(authorIds, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({
      message: "Plenary session updated successfully.",
    });
  } catch (error) {
    await transaction.rollback();

    if (req.file) {
      try {
        await fsp.unlink(
          path.join("public/uploads", folder, req.file.filename)
        );
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const sessions = await PlenarySession.findAll({
      include: {
        model: Author,
        as: "authors",
      },
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.getByConferenceData = async (conferenceId) => {
  return await PlenarySession.findAll({
    where: { conference_id: conferenceId },
    include: {
      model: Author,
      as: "authors",
    },
  });
};

exports.getByConference = async (req, res) => {
  try {
    const { conference_id } = req.body;
    const sessions = await exports.getByConferenceData(conference_id);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await PlenarySession.findByPk(id, {
      include: {
        model: Author,
        as: "authors",
      },
    });
    if (!session) {
      return res
        .status(404)
        .json({ error: "No plenary session found with this id." });
    }
    return res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await PlenarySession.findByPk(id);

    if (!session) {
      return res
        .status(404)
        .json({ error: "No plenary session found with this id" });
    }

    // Supprimer l'image si elle existe
    if (session.image) {
      const imagePath = path.join("public/uploads", session.image);
      try {
        await fsp.unlink(imagePath);
      } catch (err) {
        console.warn("Image file not found or already deleted.");
        console.log(err.message);
      }
    }

    await PlenarySession.destroy({ where: { id } });

    return res.status(200).json({
      message: "Plenary session and associated image successfully deleted.",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
