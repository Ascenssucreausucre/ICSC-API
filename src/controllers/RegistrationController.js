const { Registration, PaymentOption, Articles } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      include: [
        {
          model: PaymentOption,
          as: "options",
          attributes: ["price"],
          through: { attributes: [] },
        },
        {
          model: Articles,
          as: "articles",
          attributes: ["id"],
        },
      ],
    });

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const registration = await Registration.findByPk(id, {
      include: [
        {
          model: PaymentOption,
          as: "options",
          attributes: {
            exclude: ["conference_id"],
          },
          through: { attributes: [] },
        },
        {
          model: Articles,
          as: "articles",
          attributes: {
            exclude: ["conference_id", "registration_id"],
          },
        },
      ],
    });
    if (!registration) {
      return res
        .status(404)
        .json({ error: `No registration found with id ${id}` });
    }

    res.status(200).json(registration);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

exports.getByConference = async (req, res) => {
  const { conference_id } = req.params;
  try {
    const registrations = await Registration.findAll({
      where: { conference_id },
      include: [
        {
          model: PaymentOption,
          as: "options",
        },
        {
          model: Articles,
          as: "articles",
        },
      ],
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
