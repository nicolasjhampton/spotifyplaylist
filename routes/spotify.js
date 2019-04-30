var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers/db_wrap.js');
const { 
    spotifyAuthEndpoint, 
    setSession, 
    fetchAuth,
    authBody
} = require('./helpers/spotify_auth.js');


async function getSpotify(req, res, next, db) {
    return res.redirect(spotifyAuthEndpoint().toString());
}

async function getCallback(req, res, next, db) {
    const apiResponse = await fetchAuth(authBody(req.query.code));

    req.session.spotify_auth = await setSession(apiResponse);

    return res.redirect('../../');
}

const spotify = wrapRoutes({
    auth: [
        getSpotify,
    ],
    callback: [
        getCallback
    ]
});

router.get('/', spotify.auth);
router.get('/callback', spotify.callback);

module.exports = router;