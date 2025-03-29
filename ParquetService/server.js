import express from "express";
import schemaRoutes  from "./routes/schema.routes.js";

const app = express = express();

const PORT = 3001;
app.use(express.json());

//routes here
app.use("/api/schema",schemaRoutes);
app.use("/api/row-groups-stats",rowGroupStatsRoutes);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});