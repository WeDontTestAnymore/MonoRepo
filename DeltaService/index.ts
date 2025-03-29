import express from "express";
import { connection } from "./duckdb/duck";
import {
  getCheckpoints,
  getCommits,
  getSchema,
} from "./controller/metaController";

const app = express();
app.use(express.json());

// app.post("/checkpoints", getCheckpoints);
app.post("/commits", getCommits);
app.post("/schema", getSchema);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
