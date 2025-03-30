
import { DuckDBInstance } from '@duckdb/node-api';


// config contains minio access details
// < < < < !!!! do not start a new connection after calling this function !!!! > > > >

export const initializeDuckDBWithS3 = async (config) => {
    try {
        const instance = await DuckDBInstance.create(':memory:');
        const connection = await instance.connect();

        if (!config.key) {
            return console.error("s3 key not provided");
        }
        if (!config.secret) {
            return console.error("s3 secret not provided");
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
                                USE_SSL false

    );`)
        console.log(`Initialized DuckDB S3 with key: ${config.key}, secret: ${config.secret}, region: ${config.region}`);
        return connection
    } catch (error) {
        console.log(error.message)
    }

};


// reads iceberg manifest or manifest list file
export const readIcebergManifest = async (config, manifests3uri) => {

    initializeDuckDBWithS3(config);

    const instance = await DuckDBInstance.create(':memory:');
    const connection = await instance.connect();

    await connection.run("LOAD avro;");

    const avroFile = manifests3uri;

    const result = await connection.runAndReadAll(`SELECT * FROM read_avro('${avroFile}');`);
    const rows = result.getRowObjectsJson();
    console.log(rows);
    return rows
}




// < ! ----- Tests begin here ----- ! >

//readIcebergManifest("/home/meeth/hackathon/coep/avro-deserialiser/test-file.avro")

// const config = {
//     key: "minioadmin",
//     secret: "minioadmin"
// };
// initializeDuckDBWithS3(config);
