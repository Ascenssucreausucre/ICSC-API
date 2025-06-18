const {
  Registration,
  PaymentOption,
  Article,
  Conference,
} = require("../models");
const {
  getAdditionalFeeByConferenceData,
} = require("./AdditionalFeeController");
const {
  getCurrentRegistrationFeesWithCategoriesData,
} = require("./RegistrationFeeController");
const { Op } = require("sequelize");

exports.getAll = async (req, res) => {
  const { limit = 20, page = 1, search } = req.query;
  try {
    const whereClause = {};

    if (search && search.length > 0) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { surname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    const registrations = await Registration.findAll({
      where: whereClause,
      limit: parsedLimit,
      offset,
      include: [
        {
          model: PaymentOption,
          as: "options",
          attributes: ["price"],
          through: { attributes: [] },
        },
        {
          model: Article,
          as: "articles",
          attributes: ["id"],
        },
      ],
    });

    const total = await Registration.count({ where: whereClause });

    res.status(200).json({ registrations, total });
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
          model: Article,
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
  const { limit = 20, page = 1, search } = req.query;
  const { conference_id } = req.params;
  try {
    const whereClause = {
      conference_id,
    };

    if (search && search.length > 0) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { surname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    const registrations = await Registration.findAll({
      where: whereClause,
      limit: parsedLimit,
      offset,
      include: [
        {
          model: PaymentOption,
          as: "options",
          attributes: ["price"],
          through: { attributes: [] },
        },
        {
          model: Article,
          as: "articles",
          attributes: ["id"],
        },
        {
          model: Conference,
          as: "conference",
          attributes: ["acronym", "year"],
        },
      ],
    });

    const registrationFees = await getCurrentRegistrationFeesWithCategoriesData(
      conference_id
    );
    const additionalFees = await getAdditionalFeeByConferenceData(
      conference_id
    );

    const total = await Registration.count({ where: whereClause });

    res
      .status(200)
      .json({ registrations, total, registrationFees, additionalFees });
  } catch (error) {
    console.error(error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
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
