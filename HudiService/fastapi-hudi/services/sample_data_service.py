from minio import Minio
import pyarrow.parquet as pq
import io
import json

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


def get_sample_data(endpoint, access_key, secret_key, bucket_name, hudi_table_path, row_limit=10):
    """Fetches a sample of data from a Hudi table stored in MinIO."""
    try:
        
        secure = endpoint.startswith("https")
        minio_client = Minio(endpoint.replace("https://", "").replace("http://", ""),
                             access_key=access_key,
                             secret_key=secret_key,
                             secure=secure)

        latest_parquet = get_latest_parquet_file(minio_client, bucket_name, hudi_table_path)
        if not latest_parquet:
            return {"error": "No valid Parquet file found in the Hudi table or metadata directories"}

        obj = minio_client.get_object(bucket_name, latest_parquet)
        data = obj.read()

        table = pq.read_table(io.BytesIO(data))

        sample_data = table.to_pandas().head(row_limit).to_dict(orient="records")

        return {"sample_file": latest_parquet, "data": sample_data}

    except Exception as e:
        return {"error": str(e)}
