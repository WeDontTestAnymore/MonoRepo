from minio import Minio

SMALL_FILE_THRESHOLD = 128 * 1024 * 1024 
DATA_EXTENSIONS = (".parquet", ".log")
METADATA_EXTENSIONS = (".commit", ".deltacommit", ".compaction", ".clean", ".rollback", ".metadata")


def detect_small_files(endpoint: str, access_key: str, secret_key: str, bucket_name: str, hudi_table_path: str):
    """Analyzes small files in a Hudi table from a given MinIO/S3 location."""
    try:

        secure = endpoint.startswith("https")
        minio_client = Minio(endpoint.replace("https://", "").replace("http://", ""),
                             access_key=access_key,
                             secret_key=secret_key,
                             secure=secure)

        objects = minio_client.list_objects(bucket_name, prefix=hudi_table_path, recursive=True)

        small_data_files = []
        small_metadata_files = []
        total_small_size = 0

        for obj in objects:
            if obj.size < SMALL_FILE_THRESHOLD:
                file_info = {
                    "file_name": obj.object_name,
                    "size_bytes": obj.size,
                    "size_MB": round(obj.size / (1024 * 1024), 2),
                }
                total_small_size += obj.size

                if obj.object_name.endswith(DATA_EXTENSIONS):
                    small_data_files.append(file_info)
                elif obj.object_name.endswith(METADATA_EXTENSIONS):
                    small_metadata_files.append(file_info)

        return {
            "total_small_files": len(small_data_files) + len(small_metadata_files),
            "total_small_size_MB": round(total_small_size / (1024 * 1024), 2),
            "small_data_files": small_data_files,
            "small_metadata_files": small_metadata_files,
        }

    except Exception as e:
        return {"error": str(e)}
