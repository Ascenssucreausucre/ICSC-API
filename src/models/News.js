const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const News = sequelize.define(
    "News",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "New's title can't be empty.",
          },
        },
      },
      icon: { type: DataTypes.STRING, allowNull: true },
      from_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "From date must be a valid date." },
        },
      },
      to_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "To date must be a valid date." },
          isAfterOpening(value) {
            if (this.from_date && new Date(value) <= new Date(this.from_date)) {
              throw new Error("To date must be after from date.");
            }
          },
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "New's content can't be empty.",
          },
        },
      },
      file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences",
          key: "id",
        },
      },
    },
    {
      tableName: "news",
      timestamps: false,
    }
  );

  News.associate = (models) => {
    // Association avec Conference
    News.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
  };

  return News;
};
