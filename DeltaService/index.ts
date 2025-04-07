import express from "express";
import { connection } from "./db/duck";
import {
  commitDetails,
  getCommits,
  // getSchema,
  // getStats,
} from "./controller/metaController";

const app = express();
app.use(express.json());

// app.post("/checkpoints", getCheckpoints);
app.post("/commits", getCommits);
app.post("/details", commitDetails);
// app.post("/stats", getStats);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
