const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommitteeRole = sequelize.define(
    "CommitteeRole",
    {
      title: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "committeeroles",
      timestamps: false,
    }
  );

  return CommitteeRole;
};
