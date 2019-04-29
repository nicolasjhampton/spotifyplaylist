var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers.js');

async function getUsers(req, res, next, db) {
  const names =  await db.select().from('users').pluck('username');
  return res.status(200).json(names);
}

const users = wrapRoutes({ 
    get: [
        getUsers,
    ]
});

router.get('/', users.get)

module.exports = router;
