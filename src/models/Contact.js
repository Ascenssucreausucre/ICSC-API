const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Contact = sequelize.define(
    "Contact",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true,
          len: [5, 255],
        },
      },
      tel: {
        type: DataTypes.CHAR(20),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conferences",
          key: "id",
        },
      },
    },
    {
      tableName: "contacts",
      timestamps: false,
    }
  );

  Contact.associate = (models) => {
    Contact.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Contact;
};
