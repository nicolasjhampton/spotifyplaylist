const { URLSearchParams } = require('url');
const {
    spotifyAuthEndpoint,
    setSession,
    authBody,
    refreshBody,
    authHeader,
    formatAuthRequest,
    fetchAuth
} = require("./spotify_auth.js");

describe("spotifyAuthEndpoint", () => {
    test("returns a URL object", () => {
        const endpoint = spotifyAuthEndpoint("client_id");
        expect(endpoint).toBeInstanceOf(URL);
    });

    test("returns a URL object with the correct origin set", () => {
        const endpoint = spotifyAuthEndpoint("client_id");
        expect(endpoint.origin).toBe("https://accounts.spotify.com");
    });

    test("returns a URL object with the correct path set", () => {
        const endpoint = spotifyAuthEndpoint("client_id");
        expect(endpoint.pathname).toBe("/authorize");
    });

    test("returns a URL object with the correct client_id set", () => {
        const endpoint = spotifyAuthEndpoint("client_id");
        expect(endpoint.searchParams.get("client_id")).toBe("client_id");
    });

    test("returns a URL object with the correct response_type set", () => {
        const endpoint = spotifyAuthEndpoint("client_id");
        expect(endpoint.searchParams.get("response_type")).toBe("code");
    });

    test("returns a URL object with the correct redirect_uri set", () => {
        const endpoint = spotifyAuthEndpoint("client_id");
        expect(endpoint.searchParams.get("redirect_uri")).toBe("http://localhost:3000/spotify/callback");
    });

    test("returns a URL object with the correct string value", () => {
        const client_id = "client_id";
        const front = "https://accounts.spotify.com/authorize?client_id=";
        const back = "&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fspotify%2Fcallback";
        const endpoint = spotifyAuthEndpoint(client_id);
        expect(endpoint.toString()).toBe(`${front}${client_id}${back}`);
    });
});

describe("setSession", () => {
    test("is an async function", () => {
        const session = setSession({ json: () => Promise.resolve({}) })
        expect(session).toBeInstanceOf(Promise);
    });

    test("returns a promise that resolves to a properly formatted session object", async () => {
        const expectedSession = {
            access_token: "string",
            expires_in: 0,
            refresh_token: "string"
        }
        const session = await setSession({ json: () => Promise.resolve(expectedSession) })
        expect(session).toEqual(expect.objectContaining({
            token: expect.any(String),
            expires: expect.any(Number),
            refresh: expect.any(String),
            created_at: expect.any(Number)
        }));
    });

    test("does not return an object with a refresh token if not present", async () => {
        const expectedSession = {
            access_token: "string",
            expires_in: 0,
        }
        const session = await setSession({ json: () => Promise.resolve(expectedSession) })
        expect(session).toEqual(expect.objectContaining({
            token: expect.any(String),
            expires: expect.any(Number),
            created_at: expect.any(Number)
        }));
        expect(session.refresh).toBeUndefined();
    });
});

describe("authBody", () => {
    test("returns a URLSearchParams object", () => {
        const params = authBody("atwhayayayazycrayodecay");
        expect(params).toBeInstanceOf(URLSearchParams);
    });

    test("correctly appends the grant_type", () => {
        const params = authBody("atwhayayayazycrayodecay");
        expect(params.get('grant_type')).toBe("authorization_code");
    });

    test("correctly appends the code", () => {
        const params = authBody("atwhayayayazycrayodecay");
        expect(params.get('code')).toBe("atwhayayayazycrayodecay");
    });

    test("correctly appends the redirect_uri", () => {
        const params = authBody("atwhayayayazycrayodecay");
        expect(params.get('redirect_uri')).toBe("http://localhost:3000/spotify/callback");
    });
});

describe("refreshBody", () => {
    test("returns a URLSearchParams object", () => {
        const params = refreshBody("atwhayayayazycrayokentay");
        expect(params).toBeInstanceOf(URLSearchParams);
    });

    test("correctly appends the grant_type", () => {
        const params = refreshBody("atwhayayayazycrayokentay");
        expect(params.get('grant_type')).toBe("refresh_token");
    });

    test("correctly appends the refresh_token", () => {
        const params = refreshBody("atwhayayayazycrayokentay");
        expect(params.get('refresh_token')).toBe("atwhayayayazycrayokentay");
    });
});

describe("authHeader", () => {
    test("returns a Base64 encoded Authorization string", () => {
        const authorization = authHeader("id_string", "secret_string");
        expect(authorization).toMatch(/^Basic [\w\d]+[\=]{0,2}$/)
    });

    test("correctly concatenates and encodes the id and secret", () => {
        const authorization = authHeader("id_string", "secret_string");
        const [basic, encodedString] = authorization.split(" ");
        const buff = Buffer.from(encodedString, 'base64');
        const decodedString = buff.toString('ascii');
        const id_and_secret = decodedString.split(":");
        expect(id_and_secret).toEqual(["id_string", "secret_string"]);
    });
});

describe("formatAuthRequest", () => {
    test("returns an object with the correctly formatted object", () => {
        const fetchObj = formatAuthRequest(new URLSearchParams(), () => "string");
        expect(fetchObj).toEqual(expect.objectContaining({
            method: 'POST',
            body: expect.any(URLSearchParams),
            headers: {
                Authorization: expect.any(String)
            }
        }));
    });
})