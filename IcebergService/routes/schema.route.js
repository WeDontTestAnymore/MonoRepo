import express from "express"
import { latestMetadata } from "../utils/latestMetadata.js";
import { randGen } from "../utils/misc.js"

const router = express.Router();

// icebergPath refers to the uri of the s3 table
const getDetails = async (req, res) => {
    const {config,icebergPath} = req.body;
    if (!config.key) {
        return console.error("s3 key not provided");
    }
    if (!config.secret) {
        return console.error("s3 secret not provided");
    }
    if (!config.endpoint) {
        return console.error("s3 endpoint not provided");
    }

    // for MinIO
    if (!config.region) {
        config.region = "us-east-1";
    }

    if (!icebergPath) {
        return console.error("s3 details not provided");
    }

    try {

        const icebergMetadata = await latestMetadata(config, icebergPath);
        console.log(icebergMetadata)
        const partitions = icebergMetadata["partition-specs"];
        const primaryKey = icebergMetadata["primary-key"] || null;
        const schemaFields = icebergMetadata.schemas[0].fields.map(field => ({
            columnName: field.name,
            dataType: field.type.toUpperCase(),
            nullable: field.required ? "NO" : "YES",
            description: ""
        }));
        const sampleData = Array.from({ length: 3 }, () =>
            Object.fromEntries(schemaFields.map(field => [field.columnName, randGen(field.dataType)]))
        );
        return res.status(200).json({partitions,primaryKey,schemaFields,sampleData});

    } catch (error) {
        console.log("error in getDetails func: ", error.message);
        
    }

}


router.get("/details", getDetails);






export default router