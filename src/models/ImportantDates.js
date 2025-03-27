const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ImportantDates = sequelize.define(
    "ImportantDates",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      initial_submission_due: { type: DataTypes.DATE, allowNull: false },
      paper_decision_notification: { type: DataTypes.DATE, allowNull: false },
      final_submission_due: { type: DataTypes.DATE, allowNull: false },
      registration: { type: DataTypes.DATE, allowNull: false },
      congress_opening: { type: DataTypes.DATE, allowNull: false },
      congress_closing: { type: DataTypes.DATE, allowNull: false },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences", // Référence à la table Conferences
          key: "id",
        },
        unique: true, // Assurer qu'il n'y a qu'un seul enregistrement ImportantDates par conférence
      },
    },
    {
      tableName: "ImportantDates",
      timestamps: false,
    }
  );

  // Définir la relation avec Conference (une conférence a une seule entrée ImportantDates)
  ImportantDates.associate = (models) => {
    ImportantDates.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
    });
  };

  return ImportantDates;
};
