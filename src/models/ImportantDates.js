const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ImportantDates = sequelize.define(
    "ImportantDates",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      initial_submission_due: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Initial submission due must be a valid date." },
        },
      },

      paper_decision_notification: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Paper decision notification must be a valid date." },
        },
      },

      final_submission_due: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Final submission due must be a valid date." },
        },
      },

      registration: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Registration must be a valid date." },
        },
      },

      congress_opening: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Congress opening must be a valid date." },
        },
      },

      congress_closing: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Congress closing must be a valid date." },
          isAfterOpening(value) {
            if (
              this.congress_opening &&
              new Date(value) <= new Date(this.congress_opening)
            ) {
              throw new Error(
                "Congress closing must be after congress opening."
              );
            }
          },
        },
      },

      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences",
          key: "id",
        },
        unique: true,
      },
    },
    {
      tableName: "ImportantDates",
      timestamps: false,
    }
  );

  ImportantDates.associate = (models) => {
    ImportantDates.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
    });
  };

  return ImportantDates;
};
