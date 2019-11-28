import * as crypto from "crypto";
import * as express from "express";
import jwt from "jsonwebtoken";
import pgPromise from "pg-promise";

export const register = (app: express.Application) => {

    const PASSWORD_LENGTH = 256;
    const SALT_LENGTH = 64;
    const ITERATIONS = 10000;
    const DIGEST = "sha256";
    const BYTE_TO_STRING_ENCODING = "hex"; // this could be base64, for instance

    // tslint:disable-next-line:interface-name
    interface PersistedPassword {
        salt: string;
        hash: string;
        iterations: number;
    }

    const port = parseInt(process.env.PGPORT || "5432", 10);
    const config = {
        database: process.env.PGDATABASE || "postgres",
        host: process.env.PGHOST || "localhost",
        port,
        user: process.env.PGUSER || "postgres"
    };

    const pgp = pgPromise();
    const db = pgp(config);

    function generateHashPassword(password: string): Promise<PersistedPassword> {
        return new Promise<PersistedPassword>((accept, reject) => {
            const salt = crypto.randomBytes(SALT_LENGTH).toString(BYTE_TO_STRING_ENCODING);
            crypto.pbkdf2(password, salt, ITERATIONS, PASSWORD_LENGTH, DIGEST, (error, hash) => {
                if (error) {
                    reject(error);
                } else {
                    accept({
                        salt,
                        hash: hash.toString(BYTE_TO_STRING_ENCODING),
                        iterations: ITERATIONS,
                    });
                }
            });
        });
    }

    function verifyPassword(persistedPassword: PersistedPassword, passwordAttempt: string): Promise<boolean> {
        return new Promise<boolean>((accept, reject) => {
            // tslint:disable-next-line:max-line-length
            console.log(passwordAttempt + " " + persistedPassword.salt + " " + persistedPassword.iterations + " " + PASSWORD_LENGTH + " " + DIGEST);
            // tslint:disable-next-line:max-line-length radix
            crypto.pbkdf2(passwordAttempt, persistedPassword.salt, persistedPassword.iterations, PASSWORD_LENGTH, DIGEST, (error, hash) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(+persistedPassword.hash + " " + hash.toString(BYTE_TO_STRING_ENCODING));
                    accept(persistedPassword.hash === hash.toString(BYTE_TO_STRING_ENCODING));
                }
            });
        });
    }

    app.post(`/api/users/register`, async (req: any, res) => {
        // tslint:disable-next-line: no-console
        console.log(req.body);

        try {
            const emailExpression = /\S+@\S+\.\S+/;
            if (!req.body.email || !req.body.password) {
                return res.status(400).send({message: "Some values are missing"});
            }
            if (!emailExpression.test(String(req.body.email).toLowerCase())) {
                return res.status(400).send({message: "Please enter a valid email address"});
            }

            // @ts-ignore
            const hashedPassword = await generateHashPassword<PersistedPassword>(req.body.password);

            const result = await db.one(`INSERT INTO users( username, email, password, salt, iterations )
            VALUES( $[username], $[email], $[password], $[salt], $[iterations] )
            RETURNING id`, {
                email: req.body.email,
                password: hashedPassword.hash,
                username: req.body.username,
                salt: hashedPassword.salt,
                iterations: hashedPassword.iterations,
            });
            return res.json({result});
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.post(`/api/users/login`, async (req: any, res) => {
        try {
            const emailExpression = /\S+@\S+\.\S+/;
            if (!req.body.email || !req.body.password) {
                return res.status(400).send({message: "Some values are missing"});
            }
            if (!emailExpression.test(String(req.body.email).toLowerCase())) {
                return res.status(400).send({message: "Please enter a valid email address"});
            }
            const query = "SELECT password as hash, salt, iterations FROM users WHERE email = $1";

            const rows = await db.one(query, [req.body.email]);

            if (!rows) {
                return res.status(400).send({message: "The credentials you provided is incorrect..."});
            }

            const result = await verifyPassword(rows, req.body.password);

            if (!result) {
                return res.status(400).send({message: "The credentials you provided is incorrect"});
            }
            const token = jwt.sign({id: rows.id}, process.env.JWTSECRET, {expiresIn: 60 * 60});
            return res.status(200).send({token});
        } catch (err) {
            return res.status(400).send(err);
        }

    });

    app.get(`/api/guitars/all`, async (req: any, res) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const guitars = await db.any(`
                SELECT
                    id
                    , brand
                    , model
                    , year
                    , color
                FROM    guitars
                WHERE   user_id = $[userId]
                ORDER BY year, brand, model`, {userId});
            return res.json(guitars);
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.get(`/api/guitars/total`, async (req: any, res) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const total = await db.one(`
            SELECT  count(*) AS total
            FROM    guitars
            WHERE   user_id = $[userId]`, {userId}, (data: { total: number }) => {
                return {
                    total: +data.total
                };
            });
            return res.json(total);
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.get(`/api/guitars/find/:search`, async (req: any, res) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const guitars = await db.any(`
                SELECT
                    id
                    , brand
                    , model
                    , year
                    , color
                FROM    guitars
                WHERE   user_id = $[userId]
                AND   ( brand ILIKE $[search] OR model ILIKE $[search] )`,
                {userId, search: `%${req.params.search}%`});
            return res.json(guitars);
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.post(`/api/guitars/add`, async (req: any, res) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.one(`
                INSERT INTO guitars( user_id, brand, model, year, color )
                VALUES( $[userId], $[brand], $[model], $[year], $[color] )
                RETURNING id;`,
                {userId, ...req.body});
            return res.json({id});
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.post(`/api/guitars/update`, async (req: any, res) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.one(`
                UPDATE guitars
                SET brand = $[brand]
                    , model = $[model]
                    , year = $[year]
                    , color = $[color]
                WHERE
                    id = $[id]
                    AND user_id = $[userId]
                RETURNING
                    id;`,
                {userId, ...req.body});
            return res.json({id});
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    // app.delete(`/api/guitars/remove/:id`, async (req: any, res) => {
    //     try {
    //         const userId = req.userContext.userinfo.sub;
    //         const id = await db.result(`
    //             DELETE
    //             FROM    guitars
    //             WHERE   user_id = $[userId]
    //             AND     id = $[id]`,
    //             { userId, id: req.params.id }, (r) => r.rowCount);
    //         return res.json({ id });
    //     } catch (err) {
    //         // tslint:disable-next-line:no-console
    //         console.error(err);
    //         res.json({ error: err.message || err });
    //     }
    // });
};
