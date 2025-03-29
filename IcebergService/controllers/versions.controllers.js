import { DuckDBInstance } from '@duckdb/node-api';

const findAllVersions = async (config, tables3uri) => {
    const instance = await DuckDBInstance.create(':memory:');
    const connection = await instance.connect();

    if (!config.key) {
        return console.error("S3 key not provided");
    }
    if (!config.secret) {
        return console.error("S3 secret not provided");
    }
    if (!config.region) {
        config.region = "us-east-1";
    }

    try {
        await connection.run(`
            CREATE OR REPLACE SECRET secret (
                TYPE s3,
                KEY_ID '${config.key}',
                SECRET '${config.secret}',
                REGION '${config.region}',
                ENDPOINT '${config.endpoint}',
                USE_SSL false,
                URL_STYLE 'path'
            );
        `);
        console.log(`Initialized DuckDB S3 with key: ${config.key}, secret: ${config.secret}, region: ${config.region}`);
    } catch (error) {
        console.error("Couldn't initialize connection with S3 bucket in findAllVersions:", error.message);
        return;
    }

    try {
        const query = `
            SELECT *
            FROM read_json_auto('${tables3uri}/metadata/*.json') AS t(json_column);
        `;
        const result = await connection.runAndReadAll(query);
        const rows = result.getRowObjectsJson();


        function sortByUpdated(data) {
            return data.sort((a, b) => {
                return parseInt(a['last-updated-ms']) - parseInt(b['last-updated-ms']);
            });
        }

        function getSchemas(data) {
            return data
                .map(item => item.schemas || [])
                .flat();
        }

        const sortedRows = sortByUpdated(rows);
        const schemas = getSchemas(sortedRows);
        function extractFields(data) {
            return data.map(item => item.fields);
        }
        const res = extractFields(schemas);
        console.log(res);
        return res;

    } catch (error) {
        console.error("Error in findAllVersions:", error.message);
    }
};


export const getAllVersions = async (req, res) => {
    const { config, tables3uri } = req.body;
    console.log(config);
    try {
        const allVersionSchemas = await findAllVersions(config, tables3uri);
        console.log("schemas: ",allVersionSchemas);
        return res.status(200).json({ allVersionSchemas: allVersionSchemas });
    } catch (error) {

        console.error("Error in getAllVersions:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}


//tests
const config = {
    key: "minioadmin",
    secret: "minioadmin",
    endpoint: "127.0.0.1:9000",
    region: "us-east-1"
};

const tables3uri = "s3://iceberg-test/employment_data";

//findAllVersions(config, tables3uri);
