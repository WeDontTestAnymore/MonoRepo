import express from "express"
import { DuckDBInstance } from "@duckdb/node-api";
const router = express.Router();

router.get("/show", getSchema);

async function getSchema(req, res) {
    const instance = await DuckDBInstance.create(':memory:');
    const connection = await instance.connect();
    const { config, tables3uri } = req.body;
    try {
        if (!config.key) {
            return console.error("s3 key not provided");
        }
        if (!config.secret) {
            return console.error("s3 secret not provided");
        }
        if (!config.endpoint) {
            return console.error("s3 endpoint not provided");
        }

        // for minio
        if (!config.region) {
            config.region = "us-east-1"
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

        const query = `DESCRIBE SELECT * FROM '${tables3uri}';`
        
        console.log("query is : ",query);

        const result = await connection.runAndReadAll(query);
        const schema = result.getRowObjectsJson();
        //console.log(rows);
        res.status(200).json({schema})

    } catch (error) {
        console.log("error in getSchema", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export default router;

