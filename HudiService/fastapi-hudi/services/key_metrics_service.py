from minio import Minio
import io
import json
import pyarrow.parquet as pq

def get_metrics_from_metadata(minio_client, bucket_name, hudi_table_path):
    
    possible_metadata_files = [
        f"{hudi_table_path}/.hoodie/metadata/.hoodie_partition_metadata",
        f"{hudi_table_path}/.hoodie/metadata/files/metadata.json",
        f"{hudi_table_path}/.hoodie/metadata/table_metadata.json"
    ]

    for metadata_file in possible_metadata_files:
        try:
            obj = minio_client.get_object(bucket_name, metadata_file)
            metadata_content = obj.read().decode("utf-8")

            metadata = json.loads(metadata_content)

            return {
                "source": "metadata",
                "file_used": metadata_file,
                "total_rows": metadata.get("row_count", "Unknown"),
                "total_columns": metadata.get("column_count", "Unknown"),
                "partitions": metadata.get("partitions", "Unknown"),
                "file_size_mb": round(metadata.get("file_size_bytes", 0) / (1024 * 1024), 2),
            }
        except Exception:
            continue  

    return None 

def get_latest_parquet_file(minio_client, bucket_name, hudi_table_path):
    
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
    
    try:
        latest_parquet = get_latest_parquet_file(minio_client, bucket_name, hudi_table_path)
        if not latest_parquet:
            return {"error": "No valid Parquet file found in the Hudi table or metadata directories"}

        obj = minio_client.get_object(bucket_name, latest_parquet)
        parquet_data = io.BytesIO(obj.read())

        parquet_file = pq.ParquetFile(parquet_data)
        total_rows = parquet_file.metadata.num_rows
        total_columns = parquet_file.metadata.num_columns

        
        file_stat = minio_client.stat_object(bucket_name, latest_parquet)
        total_size_mb = round(file_stat.size / (1024 * 1024), 2)

        return {
            "source": "parquet",
            "file_used": latest_parquet,
            "total_rows": total_rows,
            "total_columns": total_columns,
            "file_size_mb": total_size_mb,
        }
    except Exception as e:
        return {"error": str(e)}

def get_key_metrics(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    
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
