const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommitteeRole = sequelize.define(
    "CommitteeRole",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      committee_id: { type: DataTypes.INTEGER, allowNull: false },
      member_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "committeeroles",
      timestamps: false,
    }
  );

  CommitteeRole.associate = (models) => {
    CommitteeRole.belongsTo(models.Committee, {
      foreignKey: "committee_id",
      as: "committee",
      onDelete: "CASCADE",
    });
    CommitteeRole.belongsTo(models.CommitteeMember, {
      foreignKey: "member_id",
      as: "member",
      onDelete: "CASCADE",
    });
  };

  return CommitteeRole;
};
