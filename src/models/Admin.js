const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Admin = sequelize.define(
    "Admin",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true,
          len: [5, 255],
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 100],
        },
      },
      role: {
        type: DataTypes.ENUM("admin", "superadmin"),
        defaultValue: "admin",
        validate: {
          isIn: [["admin", "superadmin"]],
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: true,
          min: 1,
        },
        references: {
          model: "admin",
          key: "id",
        },
      },
    },
    {
      tableName: "admin",
      timestamps: false,
    }
  );

  Admin.associate = (models) => {
    Admin.belongsTo(models.Admin, {
      as: "creator",
      foreignKey: "createdBy",
    });

    Admin.hasMany(models.Admin, {
      as: "createdAdmins",
      foreignKey: "createdBy",
    });
  };

  return Admin;
};
