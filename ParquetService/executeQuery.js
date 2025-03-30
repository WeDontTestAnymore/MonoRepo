import { DuckDBInstance } from "@duckdb/node-api";

export const executeQuery = async (config, query) => {
  try {
    if (!config?.access_key) {
      // return res.status(400).json({ error: "s3 key not provided" });
      throw new Error("s3 key not provided");
    }
    if (!config?.secret_key) {
      // return res.status(400).json({ error: "s3 secret not provided" });
      throw new Error("s3 secret not provided");
    }
    if (!config?.endpoint) {
      // return res.status(400).json({ error: "s3 endpoint not provided" });
      throw new Error("s3 endpoint not provided");
    }

    if (!config.region) {
      config.region = "us-east-1";
    }

    const instance = await DuckDBInstance.create(":memory:");
    const connection = await instance.connect();

    await connection.run(`CREATE OR REPLACE SECRET secret (
            TYPE s3,
            KEY_ID '${config.access_key}',
            SECRET '${config.secret_key}',
            REGION '${config.region}',
            ENDPOINT '${config.endpoint}',
            USE_SSL false,
            URL_STYLE 'path'
        );`);
    console.log(
      `Initialized DuckDB S3 with key: ${config.access_key}, secret: ${config.secret_key}, region: ${config.region}`,
    );

    const result = await connection.runAndReadAll(query);
    const rows = result.getRowObjectsJson();
    return rows;
  } catch (error) {
    console.log("error in executeQuery", error.message);
  }
};
