const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Conference = sequelize.define(
    "Conference",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      city: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: "Year must be integer." },
          min: { args: [2000], msg: "Year can't be smaller than 2000." },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "International Conference on Systems and Controls",
      },
      acronym: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ICSC",
      },
      conference_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: "Conference Index must be integer." },
          min: { args: [0], msg: "Conference Index can't be negative." },
        },
      },
      current: { type: DataTypes.TINYINT, defaultValue: 0 },
      banner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      primary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#eb4c4c",
      },
      secondary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#502f2f",
      },
      tertiary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#4736a8",
      },
    },
    {
      tableName: "conferences",
      timestamps: false,
    }
  );

  // 💡 Déclaration des relations ici, de façon standardisée
  Conference.associate = (models) => {
    Conference.hasMany(models.Topic, {
      foreignKey: "conference_id",
      as: "topics",
    });
    Conference.hasMany(models.RegistrationFee, {
      foreignKey: "conference_id",
      as: "registrationfees",
    });
    Conference.hasMany(models.News, {
      foreignKey: "conference_id",
      as: "news",
    });
    Conference.hasMany(models.Article, {
      foreignKey: "conference_id",
      as: "articles",
    });
    Conference.hasMany(models.Committee, {
      foreignKey: "conference_id",
      as: "committee",
    });
    Conference.hasOne(models.ImportantDates, {
      foreignKey: "conference_id",
      as: "importantDates",
    });
    Conference.hasMany(models.SpecialSession, {
      foreignKey: "conference_id",
      as: "specialSessions",
    });
    Conference.hasMany(models.Workshop, {
      foreignKey: "conference_id",
      as: "workshops",
    });
    Conference.hasMany(models.LocalInformation, {
      foreignKey: "conference_id",
      as: "localInfomations",
    });
    Conference.hasMany(models.PlenarySession, {
      foreignKey: "conference_id",
      as: "plenarySessions",
    });
    Conference.hasOne(models.AdditionalFee, {
      foreignKey: "conference_id",
      as: "additionalfees",
    });
    Conference.hasMany(models.PaymentOption, {
      foreignKey: "conference_id",
      as: "paymentOptions",
    });
    Conference.hasMany(models.Contact, {
      foreignKey: "conference_id",
      as: "contacts",
    });
  };

  return Conference;
};
