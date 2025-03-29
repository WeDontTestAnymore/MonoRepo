from minio import Minio
import io
import json
import pyarrow.parquet as pq
from urllib.parse import unquote

def get_metrics_from_metadata(minio_client, bucket_name, hudi_table_path):
    """Fetches key metrics from Hudi metadata files inside .hoodie/metadata/."""
    possible_metadata_files = [
        f"{hudi_table_path}/.hoodie/metadata/.hoodie_partition_metadata",
        f"{hudi_table_path}/.hoodie/metadata/files/metadata.json",
        f"{hudi_table_path}/.hoodie/metadata/table_metadata.json"
    ]

    for metadata_file in possible_metadata_files:
        try:
            obj = minio_client.get_object(bucket_name, metadata_file)
            metadata_content = obj.read().decode("utf-8")

            #Parsing Metadata
            metadata = json.loads(metadata_content)

            return {
                "source": "metadata",
                "file_used": metadata_file,
                "total_rows": metadata.get("row_count", "Unknown"),
                "total_columns": metadata.get("column_count", "Unknown"),
            }
        except Exception:
            continue  

    return None 

def get_latest_parquet_file(minio_client, bucket_name, hudi_table_path):
    """Finds the latest valid Parquet file in both data and metadata directories."""
    try:
        objects = list(minio_client.list_objects(bucket_name, prefix=hudi_table_path, recursive=True))

        
        parquet_files = [
            obj.object_name for obj in objects
            if obj.object_name.endswith(".parquet") and not obj.object_name.endswith(".parquet.crc")
        ]

        if not parquet_files:
            
            metadata_dirs = [
                f"{hudi_table_path}/.hoodie/metadata/",
                f"{hudi_table_path}/.hoodie/metadata/files/"
            ]
            for meta_dir in metadata_dirs:
                meta_objects = list(minio_client.list_objects(bucket_name, prefix=meta_dir, recursive=True))
                parquet_files += [
                    obj.object_name for obj in meta_objects
                    if obj.object_name.endswith(".parquet") and not obj.object_name.endswith(".parquet.crc")
                ]

        if not parquet_files:
            return None  

        return sorted(parquet_files)[-1] 
    except Exception:
        return None


def get_metrics_from_parquet(minio_client, bucket_name, hudi_table_path):
    """Fetches key metrics from the latest Parquet file if metadata is unavailable."""
    try:
        latest_parquet = get_latest_parquet_file(minio_client, bucket_name, hudi_table_path)
        if not latest_parquet:
            return {"error": "No valid Parquet file found in the Hudi table or metadata directories"}

        obj = minio_client.get_object(bucket_name, latest_parquet)
        data = obj.read()

        table = pq.read_table(io.BytesIO(data))

        return {
            "source": "parquet",
            "file_used": latest_parquet,
            "total_rows": table.num_rows,
            "total_columns": table.num_columns,
        }
    except Exception as e:
        return {"error": str(e)}


def get_key_metrics(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    """Main function: Tries metadata first, falls back to Parquet if needed."""
    try:
        
        secure = endpoint.startswith("https")
        minio_client = Minio(endpoint.replace("https://", "").replace("http://", ""),
                             access_key=access_key,
                             secret_key=secret_key,
                             secure=secure)

        
        metadata_metrics = get_metrics_from_metadata(minio_client, bucket_name, hudi_table_path)
        if metadata_metrics:
            return metadata_metrics

        
        return get_metrics_from_parquet(minio_client, bucket_name, hudi_table_path)

    except Exception as e:
        return {"error": str(e)}
