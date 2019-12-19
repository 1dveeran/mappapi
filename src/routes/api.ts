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

    interface IPatientsInformation {
        first_name: string;
        last_name: string;
        joining_date: string;
        current_address: string;
        profession: string;
        telephone_no: string;
        mobile_no: string;
        sex: string;
        age: number;
        marital_status: string;
        birth_date: string;
        is_nursing: string;
        is_pregnant: string;
        pregnancy_due_date: string;
        is_chewing: string;
        is_smoking: string;
        cigarette_count: string;
        aids: string;
        cancer: string;
        liver_disease: string;
        tb: string;
        asthma: string;
        diabetes: string;
        kidney_disease: string;
        rheumatic_disease: string;
        arthritis: string;
        epilepsy: string;
        psychiatric_treatment: string;
        thyroid_problems: string;
        blood_disease: string;
        hepatitis: string;
        radiation_treatment: string;
        ulcer: string;
        bp: string;
        herpes: string;
        respiratory_disease: string;
        venereal_disease: string;
        heart_problems: string;
        jaundice: string;
        corticosteriod_treatment: string;
        medicine_list: string;
        is_allergic_penicillin: string;
        is_allergic_sulfa: string;
        is_allergic_aspirin: string;
        is_allergic_iodine: string;
        is_allergic_localanaes: string;
        is_allergic_ibuprofen: string;
        any_other: string;
        chief_compliant: string;
        past_dental_history: string;
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

    app.post(`/api/add-patients`, async (req: any, res) => {
        // tslint:disable-next-line: no-console
        console.log(req.body);

        try {
            if (!req.body.first_name || !req.body.last_name) {
                return res.status(400).send({message: "Some values are missing"});
            }

            const query = await db.one(`
            WITH add_patients AS (
                INSERT INTO patients(first_name, last_name, joining_date, current_address, profession, telephone_no, mobile_no, sex, age, marital_status, birth_date)
                VALUES ($[first_name], $[last_name], $[joining_date], $[current_address], $[profession], $[telephone_no], $[mobile_no], $[sex], $[age], $[marital_status], $[birth_date])
                RETURNING *
            ), add_medical_info AS (
                INSERT INTO medical_info(patients_id, is_nursing, is_pregnant, pregnancy_due_date, is_chewing, is_smoking, cigarette_count)
                VALUES((SELECT id from add_patients), $[is_nursing], $[is_pregnant], $[pregnancy_due_date], $[is_chewing], $[is_smoking], $[cigarette_count])
                RETURNING *
            ), add_medical_info_list AS (
                INSERT INTO medical_info_checklist(patients_id, aids, cancer, liver_disease, tb, asthma, diabetes, kidney_disease, rheumatic_disease, arthritis, epilepsy, psychiatric_treatment, thyroid_problems, blood_disease, hepatitis, radiation_treatment, ulcer, bp, herpes, respiratory_disease, venereal_disease, heart_problems, jaundice, corticosteriod_treatment)
                VALUES((SELECT patients_id from add_medical_info), $[aids], $[cancer], $[liver_disease], $[tb], $[asthma], $[diabetes], $[kidney_disease], $[rheumatic_disease], $[arthritis], $[epilepsy], $[psychiatric_treatment], $[thyroid_problems], $[blood_disease], $[hepatitis], $[radiation_treatment], $[ulcer], $[bp], $[herpes], $[respiratory_disease], $[venereal_disease], $[heart_problems], $[jaundice], $[corticosteriod_treatment])
                RETURNING *
            ), add_medication AS (
                INSERT INTO medication(patients_id, medicine_list, is_allergic_penicillin, is_allergic_sulfa, is_allergic_aspirin, is_allergic_iodine, is_allergic_localanaes, is_allergic_ibuprofen, any_other)
                VALUES((SELECT patients_id from add_medical_info_list), $[medicine_list], $[is_allergic_penicillin], $[is_allergic_sulfa], $[is_allergic_aspirin], $[is_allergic_iodine], $[is_allergic_localanaes], $[is_allergic_ibuprofen], $[any_other])
                RETURNING *
            ), add_dental_info AS (
                INSERT INTO dental_info(patients_id, chief_compliant, past_dental_history)
                VALUES((SELECT patients_id from add_medication), $[chief_compliant], $[past_dental_history])
                RETURNING *
            )   SELECT patients_id FROM add_dental_info;
            `, {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                joining_date: req.body.joining_date,
                current_address: req.body.current_address,
                profession: req.body.profession,
                telephone_no: req.body.telephone_no,
                mobile_no: req.body.mobile_no,
                sex: req.body.sex,
                age: req.body.age,
                marital_status: req.body.marital_status,
                birth_date: req.body.birth_date,
                is_nursing: req.body.is_nursing,
                is_pregnant: req.body.is_pregnant,
                pregnancy_due_date: req.body.pregnancy_due_date,
                is_chewing: req.body.is_chewing,
                is_smoking: req.body.is_smoking,
                cigarette_count: req.body.cigarette_count,
                aids: req.body.aids,
                cancer: req.body.cancer,
                liver_disease: req.body.liver_disease,
                tb: req.body.tb,
                asthma: req.body.asthma,
                diabetes: req.body.diabetes,
                kidney_disease: req.body.kidney_disease,
                rheumatic_disease: req.body.rheumatic_disease,
                arthritis: req.body.arthritis,
                epilepsy: req.body.epilepsy,
                psychiatric_treatment: req.body.psychiatric_treatment,
                thyroid_problems: req.body.thyroid_problems,
                blood_disease: req.body.blood_disease,
                hepatitis: req.body.hepatitis,
                radiation_treatment: req.body.radiation_treatment,
                ulcer: req.body.ulcer,
                bp: req.body.bp,
                herpes: req.body.herpes,
                respiratory_disease: req.body.respiratory_disease,
                venereal_disease: req.body.venereal_disease,
                heart_problems: req.body.heart_problems,
                jaundice: req.body.jaundice,
                corticosteriod_treatment: req.body.corticosteriod_treatment,
                medicine_list: req.body.medicine_list,
                is_allergic_penicillin: req.body.is_allergic_penicillin,
                is_allergic_sulfa: req.body.is_allergic_sulfa,
                is_allergic_aspirin: req.body.is_allergic_aspirin,
                is_allergic_iodine: req.body.is_allergic_iodine,
                is_allergic_localanaes: req.body.is_allergic_localanaes,
                is_allergic_ibuprofen: req.body.is_allergic_ibuprofen,
                any_other: req.body.any_other,
                chief_compliant: req.body.chief_compliant,
                past_dental_history: req.body.past_dental_history
            });
            return res.json({query});
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.get(`/api/get-patient`, async (req: any, res) => {
        try {
            // const patientId = req.body.patient_id;
            const patientId = req.query.patient_id;
            const result = await db.any(`
                SELECT *
                FROM patients
                JOIN medical_info on patients.id = medical_info.patients_id
                JOIN medical_info_checklist on patients.id = medical_info_checklist.patients_id
                JOIN medication on patients.id = medication.patients_id
                JOIN dental_info on patients.id = dental_info.patients_id
                WHERE patients.id = $[patientId]
                `, {patientId});
            return res.json(result[0]);
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
        }
    });

    app.get(`/api/get-all-patients`, async (req: any, res) => {
        try {
            const result = await db.any(`
                SELECT *
                FROM patients
                JOIN medical_info on patients.id = medical_info.patients_id
                JOIN medical_info_checklist on patients.id = medical_info_checklist.patients_id
                JOIN medication on patients.id = medication.patients_id
                JOIN dental_info on patients.id = dental_info.patients_id
                ORDER BY patients.id DESC
                `);
            return res.json(result);
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json({error: err.message || err});
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
