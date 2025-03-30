import express from "express"
import schemaRoutes from "./routes/schema.route.js";
import propertiesRoutes from "./routes/properties.route.js";
import keyMetricsRoutes from "./routes/keyMetrics.route.js";
import versionsRoutes from "./routes/versions.route.js";
import snapshotRoutes from "./routes/snapshots.route.js";

const app = express();
const PORT = 3000;
app.use(express.json());

//routes
app.use("/api/schema", schemaRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/versions", versionsRoutes);
app.use("/api/keyMetrics", keyMetricsRoutes);
app.use("/api/snapshots", snapshotRoutes);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
