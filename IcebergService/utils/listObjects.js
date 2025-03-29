import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const listObjects = async function (s3, bucketName, folderKey) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folderKey,
    });

    const response = await s3.send(command);
    return response.Contents;
  } catch (error) {
    console.error("Error listing objects:", error);
    return [];
  }
}


// use this whenever neccessary to test


const s3 = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  forcePathStyle: true,
});
(async () => {
  const obj = await listObjects(s3, "iceberg-test", "employment_data");
  console.log(obj);
})();
