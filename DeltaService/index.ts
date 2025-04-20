import express from "express";
import { connection } from "./db/duck";
import {
  commitDetails,
  getCommits,
  getCommitSchema,
} from "./controller/metaController";
import { checkpointSchema } from "./controller/checkpointController";
import { getSnapshots, getSnapshotSizes, smallFiles } from "./controller/listFilesController";
import { getCommitStats, getSampleData } from "./controller/snapshotController";

const app = express();
app.use(express.json());

// app.post("/checkpoints", getCheckpoints);
app.post("/commits", getCommits);
app.post("/details", commitDetails);
app.post("/commitSchema", getCommitSchema );
app.post("/checkpointSchema", checkpointSchema ); 
app.post("/smallFiles", smallFiles);
app.post("/snapshots", getSnapshots);
app.post("/snapshotSizes", getSnapshotSizes);
app.post("/sampleData", getSampleData);
app.post("/commitLog", getCommitStats );

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});