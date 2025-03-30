import json
import boto3
import io
import fastavro
from botocore.exceptions import BotoCoreError, ClientError
from datetime import datetime

VALID_VERSIONING_TYPES = [".commit", ".deltacommit"]

def get_s3_client(endpoint, access_key, secret_key):
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

def list_versioning_files(s3_client, bucket_name, hudi_table_path):
    prefix = f"{hudi_table_path.strip('/')}/.hoodie/"

    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        files = [
            {
                "file_name": obj["Key"],
                "last_modified": obj["LastModified"].isoformat(),
                "size_MB": round(obj["Size"] / (1024 * 1024), 2)
            }
            for obj in response.get("Contents", [])
            if obj["Key"].endswith(tuple(VALID_VERSIONING_TYPES))
        ]
        return sorted(files, key=lambda x: x["last_modified"], reverse=True)

    except (BotoCoreError, ClientError) as e:
        return {"error": f"Failed to list versioning files: {str(e)}"}

def extract_versioning_info(s3_client, bucket_name, file_data):
    file_key = file_data["file_name"]

    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        avro_file = io.BytesIO(response["Body"].read())
        reader = fastavro.reader(avro_file)

        commit_data = [record for record in reader]
        if not commit_data:
            return {"error": f"No data found in {file_key}"}

        metadata = commit_data[0]

        timestamp = metadata.get("timestamp", None)
        formatted_time = (
            datetime.utcfromtimestamp(timestamp / 1000).isoformat()
            if timestamp else None
        )


        schema_json = metadata.get("extraMetadata", {}).get("schema")
        schema = json.loads(schema_json) if isinstance(schema_json, str) else schema_json

        version_info = {
            "file_name": file_key,
            "version_id": metadata.get("instantTime", "unknown"),  # Unique identifier
            "file_type": "commit" if file_key.endswith(".commit") else "deltacommit",
            "schema": schema.get("fields", []) if schema else {"error": "Schema not found"},
            "total_files": len(metadata.get("addedFiles", [])) + len(metadata.get("removedFiles", [])),
            "added_files": metadata.get("addedFiles", []),
            "removed_files": metadata.get("removedFiles", []),
            "last_modified": file_data["last_modified"],
            "file_size_MB": file_data["size_MB"]
        }

        if formatted_time and formatted_time != file_data["last_modified"]:
            version_info["timestamp"] = formatted_time

        return version_info

    except Exception as e:
        return {"error": f"Failed to parse {file_key}: {str(e)}"}

def get_versioning_info(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    try:
        s3_client = get_s3_client(endpoint, access_key, secret_key)

        versioning_files = list_versioning_files(s3_client, bucket_name, hudi_table_path)
        if isinstance(versioning_files, dict) and "error" in versioning_files:
            return versioning_files
        if not versioning_files:
            return {"error": "No versioning history found in .hoodie metadata"}

        version_history = [
            extract_versioning_info(s3_client, bucket_name, file)
            for file in versioning_files
        ]

        return {
            "valid_versioning_types": VALID_VERSIONING_TYPES,
            "total_versions": len(version_history),
            "versioning_history": version_history
        }

    except Exception as e:
        return {"error": f"Failed to retrieve versioning info: {str(e)}"}
