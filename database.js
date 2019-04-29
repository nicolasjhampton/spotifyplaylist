function connect() {
    const environment = process.env.NODE_ENV || 'development';
    const configuration = require('./knexfile')[environment];
    return require('knex')(configuration);
}

const db = connect();

module.exports = db;