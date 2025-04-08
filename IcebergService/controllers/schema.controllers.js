import { DuckDBInstance } from "@duckdb/node-api"

// returns schema, partition keys and primary key for the iceberg table
export const getDetails = async (req,res) => {
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

    
    

}

// returns the sample data from the table
export const getSampleData = async (req, res) => {
    try {

        const { config, s3uri } = req.body;
        const icebergMetadata = await latestMetadata(config, s3uri);

        const schemaFields = icebergMetadata.schemas[0].fields.map(field => ({
            name: field.name,
            type: field.type
        }));

        const sampleData = Array.from({ length: 3 }, () =>
            Object.fromEntries(schemaFields.map(field => [field.name, randGen(field.type)]))
        );

        res.status(200).json({ data: sampleData });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
