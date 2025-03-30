import express from 'express';

import { DuckDBInstance } from "@duckdb/node-api";

const router = express.Router();

const showSnapshots = async (req, res) => {
    const { config, icebergPath } = req.body;
    const instance = await DuckDBInstance.create(':memory:');
    const connection = await instance.connect();

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



    try {
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



        // make icberg extension compatible
        await connection.run("load iceberg");
        await connection.run("load avro");
        await connection.run("SET unsafe_enable_version_guessing = true;");

        console.log("iceberg extension loaded in showSnapshots func");
        
        // `
        // SELECT *
    
        // FROM iceberg_snapshots(
        //     %{},
        //     version = '?'
        // );
        //     `
        
        // run the query
        const result = await connection.runAndReadAll(`
        SELECT *
    
        FROM iceberg_snapshots(
            '${icebergPath}',
            version = '?'
        );
            `);
        const snapshots = result.getRowObjectsJson();
        return res.status(200).json({ snapshots });

    } catch (error) {
        console.log("error in showSnapshots func: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}


router.post("/show", showSnapshots);
export default router;