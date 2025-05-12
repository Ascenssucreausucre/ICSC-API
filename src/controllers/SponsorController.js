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
  const transaction = await Sponsor.sequelize.transaction();
  const { name, type, conference_id } = req.body;
  const folder = req.uploadFolder || "sponsor-images";
  const image = req.file ? `${folder}/${req.file.filename}` : null;

  try {
    const conference = await Conference.findByPk(conference_id, {
      transaction,
    });

    if (!conference) {
      if (req.file) {
        await fsp.unlink(
          path.join("public/uploads", folder, req.file.filename)
        );
      }
      await transaction.rollback();
      return res.status(404).json({ error: "Conference not found." });
    }

    if (!image) {
      await transaction.rollback();
      return res.status(400).json({ error: "Image is required." });
    }

    const newSponsor = await Sponsor.create(
      { name, image, type, conference_id },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      message: `Sponsor ${newSponsor.name} successfully created.`,
      newItem: newSponsor,
    });
  } catch (error) {
    await transaction.rollback();

    // Nettoyage de l'image uploadée si erreur
    if (req.file) {
      try {
        await fsp.unlink(
          path.join("public/uploads", folder, req.file.filename)
        );
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
  const transaction = await Sponsor.sequelize.transaction();
  const folder = req.uploadFolder || "sponsor-images";

  try {
    const { id } = req.params;
    const { name, type, conference_id } = req.body;

    const sponsor = await Sponsor.findByPk(id, { transaction });

    if (!sponsor) {
      if (req.file) {
        await fsp.unlink(
          path.join("public/uploads", folder, req.file.filename)
        );
      }
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: `No sponsor found with ID: ${id}.` });
    }

    let newImage = sponsor.image;
    let oldImagePath;

    if (req.file) {
      if (sponsor.image) {
        oldImagePath = path.join("public/uploads", sponsor.image);
      }
      newImage = `${folder}/${req.file.filename}`;
    }

    await sponsor.update(
      { name, image: newImage, type, conference_id },
      { transaction }
    );

    await transaction.commit();

    // Supprimer l'ancienne image si un nouveau fichier a été fourni
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    res.status(200).json({
      message: "Sponsor successfully updated.",
      newItem: sponsor,
    });
  } catch (error) {
    await transaction.rollback();

    // Supprimer le nouveau fichier en cas d’échec
    if (req.file) {
      const newFilePath = path.join(
        "public/uploads",
        folder,
        req.file.filename
      );
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }
    }

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
