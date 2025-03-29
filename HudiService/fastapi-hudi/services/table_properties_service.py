import boto3
import json

S3_ENDPOINT = "http://localhost:9000"
S3_ACCESS_KEY = "minioadmin"
S3_SECRET_KEY = "minioadmin"
BUCKET_NAME = "bucket"
TABLE_PATH = "hudi_large_table/.hoodie/"

s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY
)

def get_table_properties():
    try:
        commit_file = f"{TABLE_PATH}.commit"
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=commit_file)
        commit_json = json.loads(response["Body"].read().decode("utf-8"))
        
        properties = {
            "table_name": commit_json.get("table", {}).get("name"),
            "storage_location": f"s3://{BUCKET_NAME}/{TABLE_PATH}",
            "creation_time": commit_json.get("creationTime", "Unknown"),
        }
        return properties
    except Exception as e:
        return {"error": f"Failed to retrieve table properties: {str(e)}"}
