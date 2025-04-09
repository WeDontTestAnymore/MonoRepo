import express from 'express';
import { DuckDBInstance } from "@duckdb/node-api";

const router = express.Router();

const showSnapshots = async (req, res) => {
    const { config, icebergPath } = req.body;

    if (!config?.key || !config?.secret || !config?.endpoint) {
        return res.status(400).json({ error: "Missing S3 configuration" });
    }

    const region = config.region || "us-east-1";

    try {
        const instance = await DuckDBInstance.create(':memory:');
        const connection = await instance.connect();

        await connection.run(`
            CREATE OR REPLACE SECRET secret (
                TYPE s3,
                KEY_ID '${config.key}',
                SECRET '${config.secret}',
                REGION '${region}',
                ENDPOINT '${config.endpoint}',
                USE_SSL false,
                URL_STYLE 'path'
            );
        `);

        await connection.run("LOAD iceberg;");
        await connection.run("LOAD avro;");
        await connection.run("SET unsafe_enable_version_guessing = true;");

        console.log("DuckDB configured for S3 and Iceberg.");

        const snapshotResult = await connection.runAndReadAll(`
            SELECT snapshot_id, timestamp_ms, manifest_list
            FROM iceberg_snapshots('${icebergPath}')
            ORDER BY timestamp_ms;
        `);

        const snapshots = snapshotResult.getRowObjectsJson();
        const response = [];

        for (const { snapshot_id, timestamp_ms, manifest_list } of snapshots) {
            try {
                const manifestStats = await connection.runAndReadAll(`
                    SELECT
                        COALESCE(SUM(added_rows_count), 0) AS added_rows_count,
                        COALESCE(SUM(deleted_rows_count), 0) AS deleted_rows_count
                    FROM read_avro('${manifest_list}');
                `);

                const { added_rows_count, deleted_rows_count } = manifestStats.getRowObjectsJson()[0];
                response.push({
                    snapshot_id,
                    timestamp_ms,
                    added_rows_count,
                    deleted_rows_count
                });
            } catch (innerErr) {
                console.warn(`Could not read manifest: ${manifest_list}`, innerErr.message);
                response.push({
                    snapshot_id,
                    timestamp_ms,
                    added_rows_count: null,
                    deleted_rows_count: null,
                    error: "Failed to read manifest"
                });
            }
        }

        return res.status(200).json({ snapshots: response });

    } catch (error) {
        console.error("Error in showSnapshots:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

router.post("/show", showSnapshots);
export default router;
