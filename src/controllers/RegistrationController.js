const { Registration } = require("../models");

exports.getAll = async (req, res) => {
  const registrations = await Registration.findAll();
  res.status(200).json(registrations);
};
exports.getByConference = async (req, res) => {
  const { conference_id } = req.params;
  try {
    const registrations = await Registration.findAll({
      where: { conference_id },
    });
    res.status(200).json(registrations);
  } catch (error) {
    console.error(error.message);
    res.status(error.statusCode || 500).json(error);
  }
};
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await Registration.delete({ where: { id } });
    res.status(200).json({ message: "Deletion success" });
  } catch (error) {
    console.error(error.message);
    res.status(error.statusCode || 500).json(error);
  }
};
