var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers.js');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

function spotifyAuth() {
    const endpoint = new URL("https://accounts.spotify.com/authorize");
    endpoint.searchParams.set('client_id', process.env.spotify_client_id);
    endpoint.searchParams.set('response_type', "code");
    endpoint.searchParams.set('redirect_uri', "http://localhost:3000/spotify/callback");
    // params.append('state', ); // implement later
    // params.append('scope', );
    // params.append('show_dialog', );
    return endpoint.toString();
}

function authBody(code) {
    const params = new URLSearchParams();
    params.append('grant_type', "authorization_code");
    params.append('code', code);
    params.append('redirect_uri', "http://localhost:3000/spotify/callback")
    return params;
}

function authHeader() {
    const client_id = process.env.spotify_client_id;
    const client_secret = process.env.spotify_client_secret;
    return `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}`
}

async function getSpotify(req, res, next, db) {
    return res.redirect(spotifyAuth());
}

async function getCallback(req, res, next, db) {
    const apiResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        body: authBody(req.query.code),
        headers: {
            Authorization: authHeader()
        }
    });
    const json = await apiResponse.json();
    req.session.token = json.access_token;
    req.session.expires = json.expires_in;
    req.session.refresh = json.refresh_token;

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