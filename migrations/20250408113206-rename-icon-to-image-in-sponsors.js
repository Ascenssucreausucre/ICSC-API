"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("sponsors", "icon", "image");
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("sponsors", "image", "icon");
  },
};
