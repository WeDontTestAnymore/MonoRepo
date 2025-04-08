import { DuckDBInstance } from "@duckdb/node-api"

// returns schema, partition keys and primary key for the iceberg table
export const getDetails = async (req, res) => {
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

    } catch (error) {
        console.log("error in getDetails func: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }


}

// returns the sample data from the table
export const getSampleData = async (req, res) => {
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

        await connection.run("load iceberg");
        await connection.run("SET unsafe_enable_version_guessing = true;");

        const result = await connection.runAndReadAll(`
           select * from iceberg_scan('${icebergPath}') limit 3;
                `);
        const sampleData = result.getRowObjectsJson();
        return res.status(200).json({ sampleData });

    } catch (error) {
        console.log("error in getSampleData func: ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }

};
