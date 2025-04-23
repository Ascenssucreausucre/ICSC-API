"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("sponsors", "icon", "image");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("sponsors", "image", "icon");
  },
};
