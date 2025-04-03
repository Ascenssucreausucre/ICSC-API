// controllers/ConferenceController.js
const { Conference } = require("../models");

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
    res.status(error.statusCode || 500).json({ message: error.message });
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
  try {
    const targetedConference = await Conference.create(req.body);
    res.status(201).json({
      message: "Conférence créée avec succès",
      id: targetedConference.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConference = async (req, res) => {
  try {
    const { id } = req.params;
    const conferenceData = req.body;
    const conferenceToUpdate = await Conference.findOne({
      where: { id },
    });
    if (!conferenceToUpdate) {
      return res.status(404).json({ message: "No conference found" });
    }
    conferenceToUpdate.city = conferenceData.city || conferenceToUpdate.city;
    conferenceToUpdate.country =
      conferenceData.country || conferenceToUpdate.country;
    conferenceToUpdate.year = conferenceData.year || conferenceToUpdate.year;
    conferenceToUpdate.title = conferenceData.title || conferenceToUpdate.title;
    conferenceToUpdate.acronym =
      conferenceData.acronym || conferenceToUpdate.acronym;
    conferenceToUpdate.conference_index =
      conferenceData.conference_index || conferenceToUpdate.conference_index;

    await conferenceToUpdate.save();

    res.status(200).json({
      message: `${conferenceToUpdate.acronym}'${conferenceToUpdate.year} successfully updated.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setCurrentConference = async (req, res) => {
  try {
    const { id } = req.params;

    const conferenceToUpdate = await Conference.findOne({ where: { id } });

    if (!conferenceToUpdate) {
      return res.status(404).json({ message: "No conference found" });
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
      res.status(404).json({
        message: `No conference with id ${id} found.`,
      });
    }

    conferenceToDelete.destroy();

    res.status(200).json({
      message: `Conference ${conferenceToDelete.acronym}'${conferenceToDelete.year} successfully deleted.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
