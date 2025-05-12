const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Committee = sequelize.define(
    "Committee",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Committee type can't be empty." },
        },
      },
      conference_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "committees",
      timestamps: false,
    }
  );

  Committee.associate = (models) => {
    Committee.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
    Committee.belongsToMany(models.CommitteeMember, {
      through: models.CommitteeRole,
      foreignKey: "committee_id",
      as: "members",
    });
  };

  return Committee;
};
