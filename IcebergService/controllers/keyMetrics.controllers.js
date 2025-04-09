import { DuckDBInstance } from "@duckdb/node-api";
import { filesize } from "filesize";
import cleanFileData from "../utils/clean-file-data.js";

const findAllTableDetails = async (config, icebergPath) => {
    const instance = await DuckDBInstance.create(':memory:');
    const connection = await instance.connect();

    let totalSizeInBytes = 0;
    let totalRows = 0;
    const overheadData = [];

    if (!config.key || !config.secret || !config.endpoint) {
        console.error("Missing S3 credentials");
        return null;
    }

    if (!config.region) {
        config.region = "us-east-1";
    }

    await connection.run("SET unsafe_enable_version_guessing = true;");
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

    console.log(`Initialized DuckDB S3 with key: ${config.key}, region: ${config.region}`);

    try {
        await connection.run("INSTALL parquet;");
        await connection.run("INSTALL avro;");
        await connection.run("LOAD parquet;");
        await connection.run("LOAD avro;");

        const manifestQuery = `
            SELECT manifest_path FROM iceberg_metadata('${icebergPath}');
        `;

        const result = await connection.runAndReadAll(manifestQuery);
        const rows = result.getRowObjectsJson();

        const allCleanedRows = [];
        const seenPaths = new Set();

        for (const row of rows) {
            const manifestPath = row.manifest_path;

            const innerQuery = `
                SELECT data_file.record_count AS row_count,
                       data_file.partition,
                       data_file.file_size_in_bytes AS size_bytes,
                       data_file.file_path
                FROM read_avro('${manifestPath}');
            `;

            const res = await connection.runAndReadAll(innerQuery);
            const parquetRows = res.getRowObjectsJson();
            const cleanedRows = cleanFileData(parquetRows); // optional cleaning

            for (const row of cleanedRows) {
                if (!seenPaths.has(row.file_path)) {
                    seenPaths.add(row.file_path);
                    allCleanedRows.push(row);

                    totalRows += Number(row.row_count);
                    totalSizeInBytes += Number(row.size_bytes);

                    if (Number(row.size_bytes) < 104857600) { // < 100MB
                        overheadData.push({
                            filePath: row.file_path,
                            filesize: filesize(row.size_bytes, { standard: "jedec" })
                        });
                    }
                }
            }
        }

        const totalFileSize = filesize(totalSizeInBytes, { standard: "jedec" });

        return {
            fileData: allCleanedRows,
            totalRows,
            totalFileSize,
            overheadData
        };

    } catch (error) {
        console.error("Error in findAllTableDetails:", error.message);
        return null;
    }
};

export const getFileData = async (req, res) => {
    try {
        const { config, icebergPath } = req.body;

        if (!config || !icebergPath) {
            return res.status(400).json({ error: "Missing config or icebergPath in request body" });
        }

        const result = await findAllTableDetails(config, icebergPath);

        if (!result) {
            return res.status(500).json({ error: "Failed to fetch table details" });
        }

        const { fileData, totalRows, totalFileSize } = result;
        res.status(200).json({ fileData, totalRows, totalFileSize });

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

        const result = await findAllTableDetails(config, icebergPath);

        if (!result) {
            return res.status(500).json({ error: "Failed to fetch table details" });
        }

        res.status(200).json({ overheadData: result.overheadData });

    } catch (error) {
        console.error("Error in getOverhead:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
