var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers/db_wrap.js');
const { 
    setSession, 
    fetchAuth,
    authBody
} = require('./helpers/spotify_auth.js');


async function getCallback(req, res, next, db) {
    const apiResponse = await fetchAuth(authBody(req.query.code));

    req.session.spotify_auth = await setSession(apiResponse);

    return res.redirect('../../');
}

const spotify = wrapRoutes({
    callback: [
        getCallback
    ]
});

router.get('/callback', spotify.callback);

module.exports = router;