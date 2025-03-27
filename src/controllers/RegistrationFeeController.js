const { RegistrationFee, FeeCategory } = require("../models"); // Assurez-vous que les modèles sont correctement importés

// Récupérer tous les frais d'inscription avec leurs catégories
exports.getAllRegistrationFeesWithCategories = async (req, res) => {
  try {
    const registrationFees = await RegistrationFee.findAll({
      include: [
        {
          model: FeeCategory,
          as: "feecategories", // Correspond à l'alias défini dans l'association
          attributes: [
            "type",
            "ieee_member",
            "non_ieee_member",
            "virtual_attendance",
          ], // Attributs à récupérer
        },
      ],
    });

    // Reformater les données pour correspondre à la structure demandée
    const formattedRegistrationFees = registrationFees.map(
      (registrationFee) => {
        const country = registrationFee.description; // Le pays est dans description

        const categories = registrationFee.feecategories.map((category) => ({
          type: category.type,
          ieeeMember: category.ieee_member,
          nonIeeeMember: category.non_ieee_member,
          virtualAttendance: category.virtual_attendance,
        }));

        return {
          country: country, // Utilisation de description comme pays
          categories: categories,
        };
      }
    );

    res.status(200).json(formattedRegistrationFees);
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
  const { description, conference_id, feeCategories } = req.body; // `feeCategories` est un tableau d'objets contenant les catégories

  try {
    // Création du frais d'inscription
    const registrationFee = await RegistrationFee.create({
      description,
      conference_id,
    });

    // Si des catégories sont fournies, les créer et les associer au frais d'inscription
    if (feeCategories && feeCategories.length > 0) {
      const feeCategoryData = feeCategories.map((category) => ({
        type: category.type,
        ieee_member: category.ieeeMember,
        non_ieee_member: category.nonIeeeMember,
        virtual_attendance: category.virtualAttendance,
        registration_fee_id: registrationFee.id,
      }));

      await FeeCategory.bulkCreate(feeCategoryData);
    }

    // Réponse avec l'ID du frais d'inscription et ses catégories
    res.status(201).json({
      message: "Frais d'inscription créé avec succès!",
      id: registrationFee.id,
      description: registrationFee.description,
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

// Supprimer un frais d'inscription
exports.deleteRegistrationFee = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RegistrationFee.destroy({
      where: { id },
    });

    if (deleted === 0) {
      return res
        .status(404)
        .json({ message: "Frais d'inscription non trouvé" });
    }

    return res
      .status(200)
      .json({ message: "Frais d'inscription supprimé avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Une erreur est survenue lors de la suppression du frais d'inscription",
    });
  }
};

// Mettre à jour un frais d'inscription avec ses catégories
exports.updateRegistrationFeeWithCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, feeCategories } = req.body;

    // 1. Trouver le frais d'inscription
    const registrationFee = await RegistrationFee.findOne({ where: { id } });

    if (!registrationFee) {
      return res
        .status(404)
        .json({ message: "Frais d'inscription non trouvé" });
    }

    // 2. Mise à jour du description du frais d'inscription
    registrationFee.description = description;

    // 3. Mise à jour des catégories si des données sont fournies
    if (feeCategories && Array.isArray(feeCategories)) {
      // Récupérer toutes les catégories existantes pour ce frais d'inscription
      const existingFeeCategories = await registrationFee.getFeecategories();

      // 3.1 Supprimer les catégories qui ne sont plus dans le tableau "feeCategories"
      const categoriesToDelete = existingFeeCategories.filter(
        (existingCategory) =>
          !feeCategories.some(
            (category) => category.type === existingCategory.type
          )
      );

      for (const categoryToRemove of categoriesToDelete) {
        await categoryToRemove.destroy(); // Supprimer les catégories qui ne sont plus associées
      }

      // 3.2 Ajouter ou mettre à jour les catégories existantes
      for (const category of feeCategories) {
        // Vérifie si cette catégorie existe déjà pour ce frais d'inscription
        const existingCategory = existingFeeCategories.find(
          (existingCategory) => existingCategory.type === category.type
        );

        if (existingCategory) {
          // Si la catégorie existe déjà, on la met à jour si un des attributs a changé
          if (
            existingCategory.ieee_member !== category.ieeeMember ||
            existingCategory.non_ieee_member !== category.nonIeeeMember ||
            existingCategory.virtual_attendance !== category.virtualAttendance
          ) {
            // Mise à jour de la catégorie si nécessaire
            await existingCategory.update({
              ieee_member: category.ieeeMember,
              non_ieee_member: category.nonIeeeMember,
              virtual_attendance: category.virtualAttendance,
            });
          }
        } else {
          // Si la catégorie n'existe pas encore, on la crée
          await FeeCategory.create({
            type: category.type,
            ieee_member: category.ieeeMember,
            non_ieee_member: category.nonIeeeMember,
            virtual_attendance: category.virtualAttendance,
            registration_fee_id: registrationFee.id,
          });
        }
      }
    }

    // Sauvegarde du frais d'inscription après mise à jour
    await registrationFee.save();

    return res.status(200).json({
      message: "Frais d'inscription mis à jour avec succès",
      registrationFee,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Une erreur est survenue lors de la mise à jour des frais d'inscription",
    });
  }
};
