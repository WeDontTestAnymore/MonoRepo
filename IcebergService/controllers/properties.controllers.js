//import icebergMetadata from '../refs/iceberg_default_employment_data_metadata_v2.metadata.json' assert { type: 'json' };
import { listObjects } from "../utils/listObjects.js"
import { s3setup } from "../utils/s3.js"

export const getProperties = async (req, res) => {
    try {
        const properties = {
            tableFormat: "iceberg",
            storageLocation: icebergMetadata.location
        };

        res.status(200).json(properties);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getManifestFiles = async (req, res) => {
    try {
        const { config, bucketName, objectKey } = req.body;
        const s3 = s3setup(config);
        const obj = await listObjects(s3, bucketName, objectKey)
        const avroFiles = obj?.filter(obj => obj.Key.endsWith(".avro"))
            .map(obj => obj.Key.replace(objectKey, ""));
        const manifestFiles = avroFiles.length ? avroFiles : [];
        res.status(200).json({ manifestFiles: manifestFiles })

    } catch (error) {
        console.log(error.message)  
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getPartitionDetails = async (req, res) => {
    try {
        const partitions = icebergMetadata.partitions?.map((partition, index) => ({
            partitionId: index + 1,
            partitionKey: partition.key,
            rowCount: partition.rowCount.toLocaleString(),
            sizeMB: partition.size.toFixed(1)
        }));

        res.status(200).json({ partitions });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error" });
    }
};
