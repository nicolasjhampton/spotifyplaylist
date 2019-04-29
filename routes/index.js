var express = require('express');
var router = express.Router();

const users = require('./users.js');
const index = require('./root.js');
const spotify = require('./spotify.js');

router.use('/', index);
router.use('/users', users);
router.use('/spotify', spotify);


module.exports = router;
