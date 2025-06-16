const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Registration = sequelize.define(
    "Registration",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ieee_member: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      student: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      online: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      amount_paid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conferences",
          key: "id",
        },
      },
    },
    {
      tableName: "registrations",
      timestamps: false,
    }
  );

  Registration.associate = (models) => {
    Registration.hasMany(models.Article, {
      foreignKey: "registration_id",
      as: "articles",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Registration.belongsToMany(models.PaymentOption, {
      through: "registrationoptions",
      foreignKey: "registration_id",
      as: "options",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Registration.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Registration;
};
