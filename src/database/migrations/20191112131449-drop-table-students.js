module.exports = {
  up: queryInterface => {
    return queryInterface.dropTable('students');
  },

  down: queryInterface => {
    return queryInterface.dropTable('students');
  },
};
