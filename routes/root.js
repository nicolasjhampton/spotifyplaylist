var express = require('express');
var router = express.Router();
const { wrapRoutes } = require('./helpers/db_wrap.js');
const fetch = require('node-fetch');
const {
    checkSession
} = require('./helpers/spotify_auth.js');

const base = "https://api.spotify.com";
// "https://api.spotify.com/v1/me"
// "https://api.spotify.com/v1/me/player"
// "https://api.spotify.com/v1/me/player/currently-playing"
// "https://api.spotify.com/v1/users/{user_id}/playlists"
// "/v1/me/playlists"

function fetchDetails(request) {
    return {
        headers: {
            Authorization: `Bearer ${request.session.spotify_auth.token}`
        }
    }
}

async function processFetchRequests(requests) {
    const apiResponses = await Promise.all(requests);
    return Promise.all(apiResponses.map(apiRes => apiRes.json()))
}

function formatPlayingData(playing) {
    console.log(playing);
    const { 
        preview_url, 
        id, 
        name, 
        artists: artistArr, 
        album: { 
            id: albumId, 
            images: albumImages,
            name: albumName
        } 
    } = playing.item;

    const { url: albumCover } = albumImages.shift();
    const { id: artistId, name: artist } = artistArr.shift();

    return {
        artistId,
        trackId: id,
        albumId,
        artist,
        trackName: name,
        albumName,
        albumCover,
        previewLink: preview_url,
    }
}

/* GET home page. */
async function getIndex(req, res, next, db) {
    const [ profile, playlists, playing ] = await processFetchRequests([
        fetch(base + "/v1/me", fetchDetails(req)),
        fetch(base + "/v1/me/playlists", fetchDetails(req)),
        fetch(base + "/v1/me/player/currently-playing", fetchDetails(req))
    ]);
    const pl = playlists.items.map(playlist => ({
        playerLink: playlist.external_urls.spotify,
        id: playlist.id,
        image: playlist.images.shift().url,
        name: playlist.name,
        total: playlist.tracks.total
    }));



    // return res.status(200).json(playing);

    return res.render('index', { playlists: pl, playing: formatPlayingData(playing) });
}

const index = wrapRoutes({
    get: [
        checkSession, getIndex
    ]
});

router.get('/', index.get);


module.exports = router;