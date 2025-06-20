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
          model: "conferences",
          key: "id",
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Other Countries",
      },
    },
    {
      tableName: "registrationfees",
      timestamps: false,
    }
  );

  RegistrationFee.associate = (models) => {
    RegistrationFee.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
    });

    RegistrationFee.hasMany(models.FeeCategory, {
      foreignKey: "registration_fee_id",
      as: "feecategories",
      onDelete: "CASCADE",
    });
  };

  return RegistrationFee;
};
