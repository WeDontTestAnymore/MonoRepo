import json
import boto3
import pyarrow.parquet as pq
import io
import fastavro 
from botocore.exceptions import BotoCoreError, ClientError

def get_s3_client(endpoint, access_key, secret_key):
    
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

def get_latest_file(s3_client, bucket_name, prefix, extension):
    
    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        files = [
            (obj["Key"], obj["LastModified"]) for obj in response.get("Contents", [])
            if obj["Key"].endswith(extension)
        ]
        if not files:
            return None  

        latest_file = max(files, key=lambda x: x[1])[0]  
        return latest_file  
    except (BotoCoreError, ClientError):
        return None

def extract_schema_from_parquet(s3_client, bucket_name, file_key):
    
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        parquet_file = io.BytesIO(response["Body"].read())
        table = pq.read_table(parquet_file)

        
        metadata_schema = table.schema.metadata.get(b'org.apache.hudi.schema', b'{}').decode("utf-8")
        schema_json = json.loads(metadata_schema) if metadata_schema and metadata_schema != "{}" else None

        return schema_json.get("fields", []) if schema_json else {"error": "Schema metadata missing in Parquet file"}
    except Exception as e:
        return {"error": f"Failed to read schema from Parquet: {str(e)}"}

def extract_schema_from_json(s3_client, bucket_name, file_key):
    
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        file_bytes = response["Body"].read()

        
        try:
            commit_json = json.loads(file_bytes.decode("utf-8"))
            schema_str = commit_json.get("extraMetadata", {}).get("schema")
            schema_json = json.loads(schema_str) if isinstance(schema_str, str) else schema_str
            return schema_json.get("fields", []) if schema_json else {"error": "Schema not found in commit/deltacommit file"}
        except UnicodeDecodeError:
            pass  

       
        try:
            avro_file = io.BytesIO(file_bytes)
            avro_reader = fastavro.reader(avro_file)
            records = list(avro_reader)

            if not records:
                return {"error": "No records found in Avro commit file"}

            
            schema_str = records[0].get("extraMetadata", {}).get("schema")
            schema_json = json.loads(schema_str) if isinstance(schema_str, str) else schema_str
            return schema_json.get("fields", []) if schema_json else {"error": "Schema not found in Avro commit file"}

        except Exception as e:
            return {"error": f"Failed to extract schema from Avro commit/deltacommit: {str(e)}"}

    except Exception as e:
        return {"error": f"Failed to extract schema: {str(e)}"}

def get_table_schema(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    
    s3_client = get_s3_client(endpoint, access_key, secret_key)

    
    parquet_file = f"{hudi_table_path.strip('/')}/.hoodie/table_schema.parquet"
    try:
        s3_client.head_object(Bucket=bucket_name, Key=parquet_file)
        return extract_schema_from_parquet(s3_client, bucket_name, parquet_file)
    except (BotoCoreError, ClientError):
        pass  

    commit_file = get_latest_file(s3_client, bucket_name, f"{hudi_table_path.strip('/')}/.hoodie/", ".commit")
    if commit_file:
        return extract_schema_from_json(s3_client, bucket_name, commit_file)

    
    deltacommit_file = get_latest_file(s3_client, bucket_name, f"{hudi_table_path.strip('/')}/.hoodie/", ".deltacommit")
    if deltacommit_file:
        return extract_schema_from_json(s3_client, bucket_name, deltacommit_file)

    return {"error": "No schema found in parquet, commit, or deltacommit files"}
