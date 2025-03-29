//import icebergMetadata from '../refs/iceberg_default_employment_data_metadata_v2.metadata.json' assert { type: 'json' };
import { randGen } from "../utils/misc.js"
import { latestMetadata } from '../utils/latestMetadata.js';



export const getPartitionKeys = async (req, res) => {
    try {

        const { config, s3uri } = req.body;


        const icebergMetadata = await latestMetadata(config, s3uri);
        const partitions = icebergMetadata["partition-specs"];
        return res.status(200).send({ partitions: partitions });

    } catch (error) {
        console.error("Error fetching partition keys:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getPrimaryKey = async (req, res) => {
    try {

        const { config, s3uri } = req.body;


        const icebergMetadata = await latestMetadata(config, s3uri);
        const primaryKey = icebergMetadata["partition-specs"];
        if (!icebergMetadata["primary-key"] || icebergMetadata["primary-key"].length === 0) {
            return res.status(200).json({ message: "Primary key not found" });
        }

        res.status(200).json({ primaryKey: icebergMetadata["primary-key"] });
        return res.status(200).send({ primaryKey });

    } catch (error) {
        console.error("Error fetching partition keys:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getSchema = async (req, res) => {
    try {
        const { config, s3uri } = req.body;
        const icebergMetadata = await latestMetadata(config, s3uri);
        const schemaFields = icebergMetadata.schemas[0].fields.map(field => ({
            columnName: field.name,
            dataType: field.type.toUpperCase(),
            nullable: field.required ? "NO" : "YES",
            description: ""
        }));

        res.status(200).json({ schema: schemaFields });
    } catch (error) {
        console.error("Error fetching schema:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getSampleData = async (req, res) => {
    try {

        const { config, s3uri } = req.body;
        const icebergMetadata = await latestMetadata(config, s3uri);

        const schemaFields = icebergMetadata.schemas[0].fields.map(field => ({
            name: field.name,
            type: field.type
        }));

        const sampleData = Array.from({ length: 3 }, () =>
            Object.fromEntries(schemaFields.map(field => [field.name, randGen(field.type)]))
        );

        res.status(200).json({ data: sampleData });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

