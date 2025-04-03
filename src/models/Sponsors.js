const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sponsor = sequelize.define(
    "Sponsor",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          const rawValue = this.getDataValue("icon");
          return rawValue ? `/uploads/${rawValue}` : null; // Chemin d'accès à l'image
        },
      },
      type: { type: DataTypes.STRING, allowNull: false },
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
      tableName: "sponsors",
      timestamps: false,
    }
  );

  Sponsor.associate = (models) => {
    // Association avec Conference
    Sponsor.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
  };

  return Sponsor;
};
