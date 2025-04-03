const { RegistrationFee, FeeCategory } = require("../models");
const { Op } = require("sequelize");

// ====================== MÉTHODES "DATA" ====================== //

// Récupérer tous les frais d'inscription avec leurs catégories
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

// Récupérer les frais d'inscription d'une conférence spécifique
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

// ====================== MÉTHODES "HTTP" ====================== //

// Récupérer tous les frais d'inscription
exports.getAllRegistrationFeesWithCategories = async (req, res) => {
  try {
    const registrationFees =
      await exports.getAllRegistrationFeesWithCategoriesData();
    res.status(200).json(registrationFees);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des frais d'inscription :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les frais d'inscription d'une conférence spécifique
exports.getCurrentRegistrationFeesWithCategories = async (req, res) => {
  try {
    const { conference_id } = req.params;
    const registrationFees =
      await exports.getCurrentRegistrationFeesWithCategoriesData(conference_id);
    res.status(200).json(registrationFees);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des frais d'inscription :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un frais d'inscription avec ses catégories
exports.createRegistrationFeeWithCategories = async (req, res) => {
  const { description, conference_id, feeCategories } = req.body;

  try {
    const registrationFee = await RegistrationFee.create({
      description,
      conference_id,
    });

    if (feeCategories?.length) {
      const feeCategoryData = feeCategories.map((category) => ({
        type: category.type,
        ieee_member: category.ieeeMember,
        non_ieee_member: category.nonIeeeMember,
        virtual_attendance: category.virtualAttendance,
        registration_fee_id: registrationFee.id,
      }));
      await FeeCategory.bulkCreate(feeCategoryData);
    }

    res.status(201).json({
      message: "Frais d'inscription créé avec succès!",
      id: registrationFee.id,
      feeCategories: feeCategories || [],
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création des frais d'inscription :",
      error
    );
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un frais d'inscription avec ses catégories
exports.updateRegistrationFeeWithCategories = async (req, res) => {
  const { id } = req.params;
  const { description, feeCategories } = req.body;

  try {
    const registrationFee = await RegistrationFee.findByPk(id);
    if (!registrationFee) {
      return res
        .status(404)
        .json({ message: "Frais d'inscription non trouvé" });
    }

    await registrationFee.update({ description });

    if (feeCategories?.length) {
      const existingCategories = await FeeCategory.findAll({
        where: { registration_fee_id: id },
      });

      // Suppression des catégories qui ne sont plus dans la liste
      const existingTypes = existingCategories.map((cat) => cat.type);
      const newTypes = feeCategories.map((cat) => cat.type);
      const categoriesToDelete = existingTypes.filter(
        (type) => !newTypes.includes(type)
      );

      if (categoriesToDelete.length) {
        await FeeCategory.destroy({
          where: { registration_fee_id: id, type: categoriesToDelete },
        });
      }

      // Ajout/Mise à jour des nouvelles catégories
      for (const category of feeCategories) {
        await FeeCategory.upsert({
          registration_fee_id: id,
          type: category.type,
          ieee_member: category.ieeeMember,
          non_ieee_member: category.nonIeeeMember,
          virtual_attendance: category.virtualAttendance,
        });
      }
    }

    res
      .status(200)
      .json({ message: "Frais d'inscription mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un frais d'inscription
exports.deleteRegistrationFee = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RegistrationFee.destroy({ where: { id } });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Frais d'inscription non trouvé" });
    }

    return res
      .status(200)
      .json({ message: "Frais d'inscription supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
