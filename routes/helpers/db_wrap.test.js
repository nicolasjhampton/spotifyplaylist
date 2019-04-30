const { addDatabase, wrapRoutes } = require("./db_wrap.js");

describe("addDatabase", () => {
    let req;

    beforeAll(() => {
        req = {
            app: {
                locals: {
                    db: "database"
                }
            }
        }
    });

    test("returns an async function", () => {
        const func = addDatabase(() => {});
        try {
            expect(func(req)).toBeInstanceOf(Promise);
        } catch (e) {
            throw e;
        }
    });

    test("curries a database as a fourth argument to the function returned", async () => {
        const returnsDatabase = (req, res, next, db) => { return db; };
        const middleware = addDatabase(returnsDatabase);
        try {
            const returnValue = await middleware(req, {}, () => {});
            expect(returnValue).toBe("database");
        } catch (e) {
            throw e;
        }
    });
});

describe("wrapRoutes", () => {
    let req;

    beforeAll(() => {
        req = {
            app: {
                locals: {
                    db: "database"
                }
            }
        }
    });

    test("returns an object with the same property names as the one it received", () => {
        const object = {
            this: [],
            that: [],
            other: []
        }
        const newObject = wrapRoutes(object);
        expect(newObject).toEqual(expect.objectContaining(object));
    });

    test("wraps each function in the arrays in an async function", () => {
        const object = {
            this: [() => {}, () => {}],
            that: [() => {}],
            other: []
        }
        const newObject = wrapRoutes(object);
        try {
            expect(newObject.this[0](req)).toBeInstanceOf(Promise);
            expect(newObject.this[1](req)).toBeInstanceOf(Promise);
            expect(newObject.that[0](req)).toBeInstanceOf(Promise);
        } catch (e) {
            throw e;
        }
    });
});
