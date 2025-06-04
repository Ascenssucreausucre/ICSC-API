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
    res.status(500).json({ error: "Erreur serveur" });
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
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Créer un frais d'inscription avec ses catégories
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
      message: "Frais d'inscription créé avec succès!",
      newItem: {
        ...registrationFee.dataValues,
        feecategories: feecategories || [],
      },
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
  const { description, feecategories } = req.body;

  try {
    const registrationFee = await RegistrationFee.findByPk(id);
    if (!registrationFee) {
      return res.status(404).json({ error: "No registration fee found" });
    }

    // Mise à jour de la description
    await registrationFee.update({ description: description.toLowerCase() });

    if (Array.isArray(feecategories)) {
      // Récupérer toutes les catégories existantes
      const existingCategories = await FeeCategory.findAll({
        where: { registration_fee_id: id },
      });

      const incomingIds = feecategories
        .filter((cat) => cat.id) // on prend les catégories avec un id
        .map((cat) => cat.id);

      // Supprimer les catégories qui ne sont plus présentes dans la nouvelle liste
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

      // Traiter les nouvelles données : update ou create
      for (const category of feecategories) {
        if (category.id) {
          // Update si l'id est présent
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
          // Create si pas d'id
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
    res.status(500).json({ error: "Erreur serveur" });
  }
};
