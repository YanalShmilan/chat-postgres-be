'use strict';
const bcrypt = require('bcrypt');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Jhon',
        lastName: 'Doe',
        email: 'jhon.doe@gmail.com',
        password: await bcrypt.hash('secret', 10),
        gender: 'male',
      },
      {
        firstName: 'Sam',
        lastName: 'Smith',
        email: 'Sam.smith@gmail.com',
        password: await bcrypt.hash('secret', 10),
        gender: 'male',
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'Jane.doe@gmail.com',
        password: await bcrypt.hash('secret', 10),
        gender: 'female',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  },
};
