const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RegistrationFee = sequelize.define(
    "RegistrationFee",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conferences", // Correspond au nom de la table en BDD
          key: "id",
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Registration Fee's description/country cannot be empty.",
          },
        },
      },
    },
    {
      tableName: "registrationfees", // Assurez-vous que le nom de la table correspond à la BDD (en minuscule ici)
      timestamps: false,
    }
  );

  RegistrationFee.associate = (models) => {
    // Association avec Conference
    RegistrationFee.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
    });

    // Association avec FeeCategory
    RegistrationFee.hasMany(models.FeeCategory, {
      foreignKey: "registration_fee_id",
      as: "feecategories",
      onDelete: "CASCADE",
    });
  };

  return RegistrationFee;
};
