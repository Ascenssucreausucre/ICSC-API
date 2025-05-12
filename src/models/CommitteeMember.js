const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommitteeMember = sequelize.define(
    "CommitteeMember",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name can't be empty. If the committee member has only one name, fill the 'Name' input instead.",
          },
        },
      },
      surname: { type: DataTypes.STRING },
      affiliation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Affiliation can't be null. Fill in the committee member's country if 'affiliation' remains unclear.",
          },
        },
      },
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
