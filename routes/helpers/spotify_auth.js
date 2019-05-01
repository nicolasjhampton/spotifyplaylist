const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

function spotifyAuthEndpoint(id = process.env.spotify_client_id) {
    const endpoint = new URL("https://accounts.spotify.com/authorize");
    endpoint.searchParams.set('client_id', id);
    endpoint.searchParams.set('response_type', "code");
    endpoint.searchParams.set('redirect_uri', "http://localhost:3000/spotify/callback");
    endpoint.searchParams.set('scope', "user-read-playback-state playlist-read-private playlist-read-collaborative user-read-recently-played");
    // params.append('state', ); // implement later
    // params.append('show_dialog', );
    return endpoint;
}

async function setSession(apiResponse) {
    const json = await apiResponse.json();
    let session = {
        token: json.access_token,
        expires: json.expires_in,
        created_at: Date.now()
    };
    if(json.refresh_token) {
        session.refresh = json.refresh_token;
    }
    return session;
}

function isTokenExpired(auth) {
    return (auth.created_at + (auth.expires * 1000)) < Date.now();
}

function authBody(code) {
    const params = new URLSearchParams();
    params.append('grant_type', "authorization_code");
    params.append('code', code);
    params.append('redirect_uri', "http://localhost:3000/spotify/callback")
    return params;
}

function refreshBody(refresh_token) {
    const params = new URLSearchParams();
    params.append('grant_type', "refresh_token");
    params.append('refresh_token', refresh_token);
    return params;
}

function authHeader(id = process.env.spotify_client_id, secret = process.env.spotify_client_secret) {
    return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
}

function formatAuthRequest(params, authFunc = authHeader) {
    return {
        method: 'POST',
        body: params,
        headers: {
            Authorization: authFunc()
        }
    }
}

function fetchAuth(params) {
    return fetch("https://accounts.spotify.com/api/token", formatAuthRequest(params));
}

async function checkSession(req, res, next) {
    if(!req.session.spotify_auth) {
        return res.redirect(spotifyAuthEndpoint().toString());
    }
    if(isTokenExpired(req.session.spotify_auth)) {
        const apiResponse = await fetchAuth(refreshBody(req.session.spotify_auth.refresh));
        const newSession = await setSession(apiResponse);
        req.session.spotify_auth = { ...req.session.spotify_auth, ...newSession };
    }
    return next();
}

module.exports = {
    spotifyAuthEndpoint,
    setSession,
    authBody,
    refreshBody,
    authHeader,
    formatAuthRequest,
    fetchAuth,
    checkSession
}