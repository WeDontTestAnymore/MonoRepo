import 'fs';
import { DuckDBInstance } from "@duckdb/node-api";

export const latestMetadata = async (config, s3tableuri) => {
    if (!config.key) {
        return console.error("s3 key not provided");
    }
    if (!config.secret) {
        return console.error("s3 secret not provided");
    }
    if (!config.endpoint) {
        return console.error("s3 endpoint not provided");
    }

    // for MinIO
    if (!config.region) {
        config.region = "us-east-1";
    }

    const instance = await DuckDBInstance.create(':memory:');
    const connection = await instance.connect();

    try {

        await connection.run(`CREATE OR REPLACE SECRET secret (
            TYPE s3,
            KEY_ID '${config.key}',
            SECRET '${config.secret}',
            REGION '${config.region}',
            ENDPOINT '${config.endpoint}',
            USE_SSL false,
            URL_STYLE 'path'
        );`);
        console.log(`Initialized DuckDB S3 with key: ${config.key}, secret: ${config.secret}, region: ${config.region}`);


      

        const latestVersionQuery = ``;

        console.log("query is: ",latestVersionQuery);
        await connection.run(latestVersionQuery);

        const jsonFileResult = await connection.runAndReadAll(latestVersionQuery);

        const res = jsonFileResult.getRowObjectsJson();

        const latestMetadataFile = res[0];

       return latestMetadataFile

    } catch (error) {
        console.log("Error in latestMetadata function :", error.message);
        return;
    }


};

// Test Configuration
const config = {
    key: "minioadmin",
    secret: "minioadmin",
    endpoint: "127.0.0.1:9000"
};

const tables3uri = "s3://iceberg-test/employment_data";

//latestMetadata(config, tables3uri);