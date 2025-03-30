import express from "express";
import { DuckDBInstance } from "@duckdb/node-api";
import { executeQuery } from "./executeQuery.js";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Schema Route
app.post("/schema/show", async (req, res) => {
  const instance = await DuckDBInstance.create(":memory:");
  const connection = await instance.connect();
  const { config, parquetPath } = req.body;

  try {
    if (!config.access_key) return console.error("S3 access_key not provided");
    if (!config.secret_key) return console.error("S3 secret not provided");
    if (!config.endpoint) return console.error("S3 endpoint not provided");

    config.region = config.region || "us-east-1";

    await connection.run(`
            CREATE OR REPLACE SECRET secret (
                TYPE s3,
                KEY_ID '${config.access_key}',
                SECRET '${config.secret_key}',
                REGION '${config.region}',
                ENDPOINT '${config.endpoint}',
                USE_SSL false,
                URL_STYLE 'path'
            );
        `);

    console.log(
      `Initialized DuckDB S3 with key: ${config.access_key}, secret: ${config.secret_key}, region: ${config.region}`,
    );

    const query = `DESCRIBE SELECT * FROM '${parquetPath}';`;
    console.log("Query:", query);

    const result = await connection.runAndReadAll(query);
    res.status(200).json({ schema: result.getRowObjectsJson() });
  } catch (error) {
    console.error("Error in getSchema:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Row Group Stats Route
app.post("/row-groups-stats/parquet", async (req, res) => {
  try {
    const { config, parquetPath } = req.body;

    const queries = {
      countRowGroups: `SELECT COUNT(DISTINCT row_group_id) AS rgcount FROM parquet_metadata('${parquetPath}');`,
      getStats: `SELECT row_group_id, AVG(num_values), MIN(num_values), MAX(num_values) FROM parquet_metadata('${parquetPath}') GROUP BY ALL;`,
      countRows: `SELECT DISTINCT row_group_id, row_group_num_rows FROM parquet_metadata('${parquetPath}');`,
      getRange: `SELECT column_id, type, stats_min, stats_max FROM parquet_metadata('${parquetPath}');`,
    };

    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => ({
        [key]: await executeQuery(config, query),
      })),
    );

    res.status(200).json(Object.assign({}, ...results));
  } catch (error) {
    console.error(`Error in parquet endpoint: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
