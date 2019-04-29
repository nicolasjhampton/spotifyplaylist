
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 2, username: '@nic', email: 'nic@nic.com'},
        {id: 1, username: '@tonia', email: 'tonia@tonia.com'},
        {id: 3, username: '@ron', email: 'ron@ron.com'}
      ]);
    });
};
