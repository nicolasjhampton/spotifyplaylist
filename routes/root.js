var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers/db_wrap.js');
const fetch = require('node-fetch');
const {
    checkSession
} = require('./helpers/spotify_auth.js');

/* GET home page. */
async function getIndex(req, res, next, db) {
    const apiResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${req.session.spotify_auth.token}`
        }
    });
    const json = await apiResponse.json();

    return res.status(200).json(json);

    // return res.render('index', { title: 'Express' });
}

const index = wrapRoutes({
    get: [
        checkSession, getIndex
    ]
});

router.get('/', index.get);


module.exports = router;