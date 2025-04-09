import { DuckDBInstance } from "@duckdb/node-api"


export const getProperties = async (req, res) => {
    const { config, icebergPath } = req.body;
    try {
        const properties = {
            tableFormat: "iceberg",
            storageLocation: icebergPath
        };

        res.status(200).json(properties);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getManifestFiles = async (req, res) => {

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
            select manifest_path from iceberg_metadata('${icebergPath}}');
                `);
        
        const manifestFiles =  result.getRowObjectsJson();
        return res.status(200).json({manifestFiles});


    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error" });
    }
};
