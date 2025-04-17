// controllers/ConferenceController.js
const { Conference } = require("../models");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

// Méthode Data pour récupérer toutes les conférences
exports.getAllConferencesData = async () => {
  try {
    const conferences = await Conference.findAll();
    return conferences;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

// Endpoint HTTP pour récupérer toutes les conférences
exports.getAllConferences = async (req, res) => {
  try {
    const conferences = await exports.getAllConferencesData();
    res.json(conferences);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Méthode Data pour récupérer une conférence par ID
exports.getConferenceByIdData = async (id) => {
  try {
    const targetedConference = await Conference.findByPk(id);
    if (!targetedConference) {
      const error = new Error("Information non trouvée");
      error.statusCode = 404;
      throw error;
    }
    return targetedConference;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

// Endpoint HTTP pour récupérer une conférence par ID
exports.getConferenceById = async (req, res) => {
  try {
    const targetedConference = await exports.getConferenceByIdData(
      req.params.id
    );
    res.json(targetedConference);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Méthode Data pour récupérer la conférence actuelle (déjà présente dans votre code)
exports.getCurrentConferenceData = async () => {
  try {
    const currentConference = await Conference.findOne({
      where: { current: 1 },
    });
    if (!currentConference) {
      const error = new Error("No current conference found.");
      error.statusCode = 404;
      throw error;
    }
    return currentConference;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

// Endpoint HTTP pour récupérer la conférence actuelle (déjà présent dans votre code)
exports.getCurrentConference = async (req, res) => {
  try {
    const currentConference = await exports.getCurrentConferenceData();
    res.status(200).json({ currentConference });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.createConference = async (req, res) => {
  const banner = req.file ? req.file.filename : null;
  const { city, country, year, title, acronym, conference_index } = req.body;

  try {
    if (!banner) {
      return res.status(400).json({ error: "Banner file is required." });
    }

    const targetedConference = await Conference.create({
      city,
      country,
      year,
      title,
      acronym,
      conference_index,
      banner,
    });

    res.status(201).json({
      message: "Conférence créée avec succès",
      newItem: targetedConference,
    });
  } catch (error) {
    if (banner) {
      try {
        await fsp.unlink(path.join(__dirname, "../../public/uploads", banner));
      } catch (unlinkError) {
        console.error(
          "Erreur de suppression du banner après échec :",
          unlinkError
        );
      }
    }

    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message);
      return res.status(400).json({ error: validationErrors });
    }

    res.status(500).json({ error: error.message });
  }
};

exports.updateConference = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, country, year, acronym, conference_index } = req.body;
    const conferenceToUpdate = await Conference.findOne({ where: { id } });

    if (!conferenceToUpdate) {
      return res.status(404).json({ error: "No conference found" });
    }

    let newBanner = conferenceToUpdate?.banner;

    if (req.file) {
      // Supprimer l'ancien fichier banner
      const oldBannerPath = path.join(
        __dirname,
        "../../public/uploads",
        newBanner
      );
      if (fs.existsSync(oldBannerPath)) {
        fs.unlinkSync(oldBannerPath);
      }
      newBanner = req.file.filename;
    }

    await conferenceToUpdate.update({
      city,
      country,
      year,
      acronym,
      conference_index,
      banner: newBanner,
    });

    res.status(200).json({
      message: `${conferenceToUpdate.acronym}'${conferenceToUpdate.year} successfully updated.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    fs.unlinkSync(req.file.filename);
  }
};

exports.setCurrentConference = async (req, res) => {
  try {
    const { id } = req.params;

    const conferenceToUpdate = await Conference.findOne({ where: { id } });

    if (!conferenceToUpdate) {
      return res.status(404).json({ error: "No conference found" });
    }

    await Conference.update({ current: 0 }, { where: { current: 1 } });

    conferenceToUpdate.current = 1;
    await conferenceToUpdate.save();

    res.status(200).json({
      message: `${conferenceToUpdate.acronym}'${conferenceToUpdate.year} is now set as current.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteConference = async (req, res) => {
  try {
    const { id } = req.params;
    const conferenceToDelete = await Conference.findByPk(id);

    if (!conferenceToDelete) {
      return res.status(404).json({
        error: `No conference with id ${id} found.`,
      });
    }

    // Supprimer le fichier banner s'il existe
    const bannerPath = path.join(
      __dirname,
      "../../public/uploads",
      conferenceToDelete.banner
    );
    if (fs.existsSync(bannerPath)) {
      fs.unlinkSync(bannerPath);
    }

    await conferenceToDelete.destroy();

    res.status(200).json({
      message: `Conference ${conferenceToDelete.acronym}'${conferenceToDelete.year} successfully deleted.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
