// controllers/ConferenceController.js
const { Conference } = require("../models");

exports.getAllConferences = async (req, res) => {
  try {
    const conferences = await Conference.findAll();
    res.json(conferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConferenceById = async (req, res) => {
  try {
    const targetedConference = await Conference.findByPk(req.params.id);
    if (!targetedConference) {
      return res.status(404).json({ message: "Information non trouvée" });
    }
    res.json(targetedConference);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
