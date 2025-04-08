import { DuckDBInstance } from "@duckdb/node-api";
import { initializeDuckDBWithS3 } from "../utils/duck-db.js";
import { filesize } from "filesize";

//config contains minio access details and icebergPath contains location for table to fetch metadta

const findTableDetails = async (config, icebergPath) => {
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

    await connection.run("SET unsafe_enable_version_guessing = true;");

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

    try {

        await connection.run("INSTALL parquet;");

        const query = `
        select file_path from iceberg_metadata('${icebergPath}');

    `;

        //console.log("query is : ", query);

        const result = await connection.runAndReadAll(query);
        const rows = result.getRowObjectsJson();

        const resultArray = [];

        for (const row of rows) {
            const filePath = row.file_path;

            const innerquery = `
           SELECT 
  '${filePath}' AS file_path,
  SUM(row_group_num_rows) AS total_rows,
  CASE
    WHEN SUM(total_compressed_size) >= 1073741824 THEN ROUND(SUM(total_compressed_size) / 1073741824.0, 2) || ' GB'
    WHEN SUM(total_compressed_size) >= 1048576 THEN ROUND(SUM(total_compressed_size) / 1048576.0, 2) || ' MB'
    WHEN SUM(total_compressed_size) >= 1024 THEN ROUND(SUM(total_compressed_size) / 1024.0, 2) || ' KB'
    ELSE SUM(total_compressed_size) || ' B'
  END AS file_size
FROM parquet_metadata('${filePath}')

          `;

            const res = await connection.runAndReadAll(innerquery);
            const parquetRows = res.getRowObjectsJson();
            //console.log(parquetRows);  
            resultArray.push(parquetRows);
        }

        console.log("resultant array is : ", resultArray);
        return resultArray
    } catch (error) {
        console.log(error.message);
    }
};





export const getTotalFileSize = async (req, res) => {
    try {
        const { config, icebergPath } = req.body;

        if (!config || !icebergPath) {
            return res.status(400).json({ error: "Missing config or icebergPath in request body" });
        }

        const result = await findTableDetails(config, icebergPath);
        const totalFileSize = result.reduce((sum, result) => sum + result.size_bytes, 0);

        if (!result) {
            return res.status(500).json({ error: "Failed to fetch table details" });
        }
        res.status(200).json({ totalFileSize: filesize(totalFileSize, { standard: "jedec" }) });
    } catch (error) {
        console.error("Error in getTotalFileSize:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getFileData = async (req, res) => {
    try {
        const { config, icebergPath } = req.body;

        if (!config || !icebergPath) {
            return res.status(400).json({ error: "Missing config or icebergPath in request body" });
        }

        const fileData = await findTableDetails(config, icebergPath);

        if (!fileData || !Array.isArray(fileData)) {
            return res.status(500).json({ error: "Failed to fetch table details" });
        }

        res.status(200).json({ fileData });
    } catch (error) {
        console.error("Error in getFileData:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getOverhead = async (req, res) => {
    try {
        const { config, icebergPath } = req.body;

        if (!config || !icebergPath) {
            return res.status(400).json({ error: "Missing config or icebergPath in request body" });
        }

        const result = await findTableDetails(config, icebergPath);

        if (!result) {
            return res.status(500).json({ error: "Failed to fetch table details" });
        }

        const files = result
            .filter(item => item.size_bytes <= 100000000)
            .map(item => ({ file_name: item.file_name, size: item.size_bytes }));

        const overhead = files.map(item => ({ file_name: item.file_name, size: filesize(item.size, { standard: "jedec" }) }));

        res.status(200).json({ overhead });
    } catch (error) {
        console.error("Error in getOverhead:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

//tests
const config = {
    key: "minioadmin",
    secret: "minioadmin",
    endpoint: "127.0.0.1:9000"
};

const icebergPath = "s3://iceberg-test/employment_data";
// findTableDetails(config, icebergPath)
