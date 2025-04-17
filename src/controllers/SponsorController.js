const { Sponsor, Conference } = require("../models");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const { Op } = require("sequelize");

// ====================== MÉTHODES "DATA" ====================== //

// Récupérer tous les sponsors avec leur conférence
exports.getAllSponsorsData = async () => {
  return await Sponsor.findAll({
    include: [{ model: Conference, as: "conference", attributes: ["year"] }],
  });
};

// Récupérer les sponsors par conférence
exports.getSponsorsByConferenceData = async (conference_id) => {
  return await Sponsor.findAll({
    where: { conference_id },
    include: [{ model: Conference, as: "conference", attributes: ["year"] }],
  });
};

// ====================== MÉTHODES "HTTP" ====================== //

// Récupérer tous les sponsors
exports.getAllSponsors = async (req, res) => {
  try {
    const sponsors = await exports.getAllSponsorsData();
    res.status(200).json(sponsors); // Retourne toujours 200, même si la liste est vide
  } catch (error) {
    console.error("Error fetching all sponsors:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les sponsors d'une conférence spécifique
exports.getSponsorsByConference = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const sponsors = await exports.getSponsorsByConferenceData(conference_id);
    res.status(200).json(sponsors);
  } catch (error) {
    console.error("Error fetching sponsors by conference:", error);
    res.status(500).json({ error: error.message });
  }
};

// Créer un sponsor
exports.createSponsor = async (req, res) => {
  const { name, type, conference_id } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const conference = await Conference.findByPk(conference_id);

    if (!conference) {
      // Supprimer l'image uploadée si la conférence est introuvable
      if (image) {
        await fsp.unlink(path.join("public/uploads", image));
      }
      return res.status(404).json({ error: "Conference not found." });
    }

    if (!image) {
      return res.status(400).json({ error: "Image is required." });
    }

    const newSponsor = await Sponsor.create({
      name,
      image,
      type,
      conference_id,
    });

    res.status(201).json({
      message: `Sponsor ${newSponsor.name} successfully created.`,
      newItem: newSponsor,
    });
  } catch (error) {
    // Supprimer l'image si une erreur s'est produite et que le fichier existe
    if (image) {
      try {
        await fsp.unlink(path.join("public/uploads", image));
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    console.error("Error creating sponsor:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un sponsor
exports.updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, conference_id } = req.body;

    // Vérifie si le sponsor existe
    const sponsor = await Sponsor.findByPk(id);
    if (!sponsor) {
      return res
        .status(404)
        .json({ error: `No sponsor found with ID: ${id}.` });
    }

    let newIcon = sponsor.image; // Garde l'ancienne image par défaut

    if (req.file) {
      // Supprime l'ancienne image si elle existe
      const oldImagePath = path.join(
        __dirname,
        "../../public/uploads",
        sponsor.image
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      newIcon = req.file.filename;
    }

    // Mise à jour du sponsor
    await sponsor.update({ name, image: newIcon, type, conference_id });

    res.status(200).json({
      message: "Sponsor successfully updated.",
      newItem: sponsor,
    });
  } catch (error) {
    console.error("Error updating sponsor:", error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un sponsor
exports.deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByPk(id);

    if (!sponsor) {
      return res
        .status(404)
        .json({ error: `No sponsor found with ID: ${id}.` });
    }

    // Supprime l'image associée si elle existe
    const imagePath = path.join(
      __dirname,
      "../../public/uploads",
      sponsor.image
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Supprime le sponsor en base de données
    await sponsor.destroy();

    res.status(200).json({ message: "Sponsor successfully deleted." });
  } catch (error) {
    console.error("Error deleting sponsor:", error);
    res.status(500).json({ error: error.message });
  }
};
