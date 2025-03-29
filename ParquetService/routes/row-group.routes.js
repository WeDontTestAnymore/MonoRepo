import express from "express";
const router = express.Router();

import connection from "./dbConnection"; 

router.get("/count", countRowGroups);



async function countRowGroups(req, res) {
    try {
        const { config, tables3uri } = req.body;

        if (!config?.key) {
            return res.status(400).json({ error: "s3 key not provided" });
        }
        if (!config?.secret) {
            return res.status(400).json({ error: "s3 secret not provided" });
        }
        if (!config?.endpoint) {
            return res.status(400).json({ error: "s3 endpoint not provided" });
        }

        if (!config.region) {
            config.region = "us-east-1";
        }

        await connection.run(`CREATE OR REPLACE SECRET secret (
            TYPE s3,
            KEY_ID '${config.key}',
            SECRET '${config.secret}',
            REGION '${config.region}',
            ENDPOINT '${config.endpoint}',
            USE_SSL false,
            URL_STYLE 'path'
        );`)
        console.log(`Initialized DuckDB S3 with key: ${config.key}, secret: ${config.secret}, region: ${config.region}`);

        const query = ` SELECT count(distinct row_group_id ) FROM '${tables3uri}';`

        const result = await connection.runAndReadAll(query);
        const count = result.getRowObjectsJson();
        res.status(200).json({count});

    } catch (error) {
        console.log("error in countRowGroups func : ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
