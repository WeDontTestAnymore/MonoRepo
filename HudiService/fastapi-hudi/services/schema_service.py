import json
import boto3
import pyarrow.parquet as pq
import io

def get_s3_client(endpoint, access_key, secret_key):
    """Initialize an S3 client dynamically."""
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

def get_latest_file(s3_client, bucket_name, prefix, extension):
    """Fetch the latest file with the given extension."""
    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        files = [obj["Key"] for obj in response.get("Contents", []) if obj["Key"].endswith(extension)]
        return max(files) if files else None
    except Exception:
        return None

def extract_schema_from_parquet(s3_client, bucket_name, file_key):
    """Extract schema from a Parquet file."""
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        parquet_file = io.BytesIO(response["Body"].read())
        table = pq.read_table(parquet_file)
        schema = json.loads(table.schema.metadata.get(b'org.apache.hudi.schema', b'{}').decode("utf-8"))
        return {"schema": schema} if schema else {"error": "Schema not found in metadata"}
    except Exception as e:
        return {"error": f"Failed to read schema from Parquet: {str(e)}"}

def extract_schema_from_json(s3_client, bucket_name, file_key):
    """Extract schema from a JSON-based commit/deltacommit file."""
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        commit_json = json.loads(response["Body"].read().decode("utf-8"))
        
        extra_metadata = commit_json.get("extraMetadata", {})
        if "schema" in extra_metadata:
            schema_str = extra_metadata["schema"]
            
            if isinstance(schema_str, str):
                schema_str = json.loads(schema_str)

            return {"schema": schema_str}
        
        return {"error": "Schema not found in commit/deltacommit file"}
    except Exception as e:
        return {"error": f"Failed to extract schema from commit/deltacommit: {str(e)}"}

def get_table_schema(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    """Retrieve Hudi table schema from available sources."""
    
    s3_client = get_s3_client(endpoint, access_key, secret_key)

    parquet_file = f"{hudi_table_path.strip('/')}/.hoodie/table_schema.parquet"
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=parquet_file)
        if response:
            return extract_schema_from_parquet(s3_client, bucket_name, parquet_file)
    except:
        pass  
    
    
    commit_file = get_latest_file(s3_client, bucket_name, hudi_table_path, ".commit")
    if commit_file:
        return extract_schema_from_json(s3_client, bucket_name, commit_file)

    
    deltacommit_file = get_latest_file(s3_client, bucket_name, hudi_table_path, ".deltacommit")
    if deltacommit_file:
        return extract_schema_from_json(s3_client, bucket_name, deltacommit_file)

    return {"error": "No schema found in parquet, commit, or deltacommit files"}
