const { RegistrationFee, FeeCategory } = require("../models");
const { Op } = require("sequelize");

exports.getAllRegistrationFeesWithCategoriesData = async () => {
  return await RegistrationFee.findAll({
    include: [
      {
        model: FeeCategory,
        as: "feecategories",
        attributes: [
          "type",
          "ieee_member",
          "non_ieee_member",
          "virtual_attendance",
        ],
      },
    ],
  });
};

exports.getCurrentRegistrationFeesWithCategoriesData = async (
  conference_id
) => {
  return await RegistrationFee.findAll({
    where: { conference_id },
    include: [
      {
        model: FeeCategory,
        as: "feecategories",
        attributes: [
          "type",
          "ieee_member",
          "non_ieee_member",
          "virtual_attendance",
        ],
      },
    ],
  });
};

exports.getAllRegistrationFeesWithCategories = async (req, res) => {
  try {
    const registrationFees =
      await exports.getAllRegistrationFeesWithCategoriesData();
    res.status(200).json(registrationFees);
  } catch (error) {
    console.error("Error while retreiving registrations fees:", error);
    res
      .status(500)
      .json({ error: "Error while retreiving registrations fees:", error });
  }
};

exports.getCurrentRegistrationFeesWithCategories = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const registrationFees =
      await exports.getCurrentRegistrationFeesWithCategoriesData(conference_id);
    res.status(200).json(registrationFees);
  } catch (error) {
    console.error("Error while retreiving registrations fees:", error);
    res
      .status(500)
      .json({ error: "Error while retreiving registrations fees:", error });
  }
};

exports.createRegistrationFeeWithCategories = async (req, res) => {
  const { description, conference_id, feecategories } = req.body;

  try {
    const registrationFee = await RegistrationFee.create({
      description: description.toLowerCase(),
      conference_id,
    });

    if (feecategories?.length) {
      const feeCategoryData = feecategories.map((category) => ({
        type: category.type,
        ieee_member: category.ieee_member,
        non_ieee_member: category.non_ieee_member,
        virtual_attendance:
          category.virtual_attendance === ""
            ? null
            : category.virtual_attendance,
        registration_fee_id: registrationFee.id,
      }));
      await FeeCategory.bulkCreate(feeCategoryData);
    }

    res.status(201).json({
      message: "Registration fee has been successfully created.",
      newItem: {
        ...registrationFee.dataValues,
        feecategories: feecategories || [],
      },
    });
  } catch (error) {
    console.error("Error while retreiving registrations fee:", error);
    res
      .status(500)
      .json({ error: "Error while creating registrations fee:", error });
  }
};

exports.updateRegistrationFeeWithCategories = async (req, res) => {
  const { id } = req.params;
  const { description, feecategories } = req.body;

  try {
    const registrationFee = await RegistrationFee.findByPk(id);
    if (!registrationFee) {
      return res.status(404).json({ error: "No registration fee found" });
    }

    await registrationFee.update({ description: description.toLowerCase() });

    if (Array.isArray(feecategories)) {
      const existingCategories = await FeeCategory.findAll({
        where: { registration_fee_id: id },
      });

      const incomingIds = feecategories
        .filter((cat) => cat.id)
        .map((cat) => cat.id);

      const toDelete = existingCategories.filter(
        (cat) => !incomingIds.includes(cat.id)
      );
      if (toDelete.length) {
        await FeeCategory.destroy({
          where: {
            id: toDelete.map((cat) => cat.id),
          },
        });
      }

      for (const category of feecategories) {
        if (category.id) {
          await FeeCategory.update(
            {
              type: category.type,
              ieee_member: category.ieee_member,
              non_ieee_member: category.non_ieee_member,
              virtual_attendance: category.virtual_attendance,
            },
            { where: { id: category.id, registration_fee_id: id } }
          );
        } else {
          await FeeCategory.create({
            type: category.type,
            ieee_member: category.ieee_member,
            non_ieee_member: category.non_ieee_member,
            virtual_attendance:
              category.virtual_attendance === ""
                ? null
                : category.virtual_attendance,
            registration_fee_id: id,
          });
        }
      }
    }

    res.status(200).json({ message: "Registration fee updated successfully." });
  } catch (error) {
    console.error("Error while updating :", error);
    res.status(500).json({ error: "Internal error" });
  }
};

exports.deleteRegistrationFee = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RegistrationFee.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Registration fees not found" });
    }

    return res
      .status(200)
      .json({ message: "Registration fee has been successfullt deleted." });
  } catch (error) {
    console.error("Error while retreiving registrations fees:", error);
    res
      .status(500)
      .json({ error: "Error while retreiving registrations fees:", error });
  }
};
