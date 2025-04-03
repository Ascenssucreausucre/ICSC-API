const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommitteeMember = sequelize.define(
    "CommitteeMember",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING },
      surname: { type: DataTypes.STRING },
      affiliation: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "committeemembers",
      timestamps: false,
    }
  );

  CommitteeMember.associate = (models) => {
    CommitteeMember.belongsToMany(models.Committee, {
      through: models.CommitteeRole,
      foreignKey: "member_id",
      as: "committees",
    });
  };

  return CommitteeMember;
};
