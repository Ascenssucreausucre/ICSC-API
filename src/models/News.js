const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const News = sequelize.define(
    "News",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      icon: { type: DataTypes.STRING, allowNull: false },
      from_date: { type: DataTypes.DATE, allowNull: false },
      to_date: { type: DataTypes.DATE, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
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
