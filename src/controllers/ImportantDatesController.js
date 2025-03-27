const { ImportantDates } = require("../models");

exports.getAllImportantDates = async (req, res) => {
  try {
    const dates = await ImportantDates.findAll();
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getImportantDatesById = async (req, res) => {
  try {
    const dates = await ImportantDates.findByPk(req.params.id);
    if (!dates) {
      return res.status(404).json({ message: "Dates non trouvées" });
    }
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createImportantDate = async (req, res) => {
  try {
    const importantDate = await ImportantDates.create(req.body);
    res.status(201).json({
      message: "Dates successfully added",
      id: importantDate.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateImportantDates = async (req, res) => {
  try {
    const { conference_id } = req.params; // On récupère l'ID de la conférence depuis les paramètres de l'URL
    const {
      initial_submission_due,
      paper_decision_notification,
      final_submission_due,
      registration,
      congress_opening,
      congress_closing,
    } = req.body; // Les nouvelles dates envoyées dans le corps de la requête

    // Recherche de l'enregistrement correspondant à la conférence
    const importantDates = await ImportantDates.findOne({
      where: { conference_id },
    });

    if (!importantDates) {
      return res
        .status(404)
        .json({ message: "Important dates not found for this conference" });
    }

    // Mise à jour des dates importantes
    importantDates.initial_submission_due = initial_submission_due;
    importantDates.paper_decision_notification = paper_decision_notification;
    importantDates.final_submission_due = final_submission_due;
    importantDates.registration = registration;
    importantDates.congress_opening = congress_opening;
    importantDates.congress_closing = congress_closing;

    // Sauvegarde de l'enregistrement mis à jour
    await importantDates.save();

    return res.status(200).json({
      message: "Important dates updated successfully",
      importantDates,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the important dates",
    });
  }
};

exports.deleteImportantDates = async (req, res) => {
  try {
    const { conference_id } = req.params; // L'ID de la conférence passé dans l'URL

    // Suppression de l'enregistrement de dates importantes pour une conférence donnée
    const deleted = await ImportantDates.destroy({
      where: {
        conference_id: conference_id, // On cherche l'enregistrement avec cet ID de conférence
      },
    });

    // Si aucune ligne n'a été supprimée, cela signifie que l'élément n'existe pas
    if (deleted === 0) {
      return res
        .status(404)
        .json({ message: "Important dates not found for this conference" });
    }

    return res
      .status(200)
      .json({ message: "Important dates deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while deleting the important dates",
    });
  }
};
