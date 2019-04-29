var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers.js');
const fetch = require('node-fetch');

/* GET home page. */
async function getIndex(req, res, next, db) {
    if(!req.session.token) {
        return res.redirect('/spotify');
    }
    const apiResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${req.session.token}`
        }
    });
    const json = await apiResponse.json();

    return res.status(200).json(json);

    // return res.render('index', { title: 'Express' });
}

const index = wrapRoutes({
    get: [
        getIndex,
    ]
});

router.get('/', index.get);


module.exports = router;