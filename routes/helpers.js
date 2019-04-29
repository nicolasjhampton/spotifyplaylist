function addDatabase(middleware) {
    return async function(req, res, next) {
        const db = req.app.locals.db;
        return middleware(req, res, next, db);
    }
}

function wrapRoutes(routes) {
    return Object.keys(routes).reduce((acc, cur) => {
        acc[cur] = routes[cur].map(route => {
            return addDatabase(route);
        });
        return acc;
    }, {});
}

module.exports = {
    wrapRoutes
}