import duckdb from "@duckdb/node-api";
import { DuckDBInstance } from "@duckdb/node-api";

const db = await DuckDBInstance.create(":memory:");
const connection = await db.connect();

console.log("Loading Delta extension");
await connection.run("INSTALL delta;LOAD delta;");
console.log("Loading HTTPFS extension");
await connection.run("INSTALL httpfs; LOAD httpfs;");

export { connection };
