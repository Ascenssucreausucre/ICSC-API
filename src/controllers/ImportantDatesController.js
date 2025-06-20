const { ImportantDates } = require("../models");

exports.getAllImportantDatesData = async () => {
  return await ImportantDates.findAll();
};

exports.getImportantDatesByIdData = async (id) => {
  return await ImportantDates.findByPk(id);
};

exports.getCurrentImportantDatesData = async (conference_id) => {
  try {
    const currentDates = await ImportantDates.findOne({
      where: { conference_id },
    });

    return currentDates;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

exports.getAllImportantDates = async (req, res) => {
  try {
    const dates = await exports.getAllImportantDatesData();
    res.status(200).json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getImportantDatesById = async (req, res) => {
  try {
    const { id } = req.params;
    const dates = await exports.getImportantDatesByIdData(id);

    if (!dates) {
      return res.status(404).json({ error: "No dates found" });
    }

    res.status(200).json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentImportantDates = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const currentDates = await exports.getCurrentImportantDatesData(
      conference_id
    );
    res.status(200).json(currentDates);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

exports.createImportantDate = async (req, res) => {
  try {
    const { conference_id } = req.body;
    const existing = await ImportantDates.findOne({
      where: { conference_id },
    });
    if (existing) {
      return res.status(401).json({
        error:
          "Important dates already added for this conference. Please use the update function instead.",
      });
    }
    const importantDate = await ImportantDates.create(req.body);
    res.status(201).json({
      message: "Dates successfully added",
      newItem: importantDate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateImportantDates = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const updated = await ImportantDates.update(req.body, {
      where: { conference_id },
    });

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Important dates not found for this conference" });
    }

    return res.status(200).json({
      message: "Important dates updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while updating the important dates",
    });
  }
};

// Supprime les dates importantes d'une conférence
exports.deleteImportantDates = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const deleted = await ImportantDates.destroy({ where: { conference_id } });

    if (deleted === 0) {
      return res
        .status(404)
        .json({ error: "Important dates not found for this conference" });
    }

    return res
      .status(200)
      .json({ message: "Important dates deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while deleting the important dates",
    });
  }
};
