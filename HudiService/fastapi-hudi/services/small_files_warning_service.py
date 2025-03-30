from minio import Minio
from urllib.parse import unquote

DEFAULT_SMALL_FILE_THRESHOLD_MB = 128  
DATA_EXTENSIONS = (".parquet", ".log")
METADATA_EXTENSIONS = (".commit", ".deltacommit", ".compaction", ".clean", ".rollback", ".metadata")

def detect_small_files(endpoint: str, access_key: str, secret_key: str, bucket_name: str, hudi_table_path: str, small_file_size_MB: int = DEFAULT_SMALL_FILE_THRESHOLD_MB):
    try:
        
        small_file_threshold = small_file_size_MB * 1024 * 1024

        secure = endpoint.startswith("https")
        minio_client = Minio(
            unquote(endpoint.replace("https://", "").replace("http://", "")),
            access_key=unquote(access_key),
            secret_key=unquote(secret_key),
            secure=secure
        )

        objects = list(minio_client.list_objects(bucket_name, prefix=hudi_table_path, recursive=True))

        if not objects:
            return {"warning": "No objects found in the specified path."}

        small_data_files = []
        small_metadata_files = []
        total_small_size = 0

        for obj in objects:
            if obj.size < small_file_threshold:
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
            "defined_small_file_size_MB": small_file_size_MB,
            "total_small_files": len(small_data_files) + len(small_metadata_files),
            "total_small_size_MB": round(total_small_size / (1024 * 1024), 2) if total_small_size > 0 else 0,
            "small_data_files": small_data_files,
            "small_metadata_files": small_metadata_files,
        }

    except Exception as e:
        return {"error": f"Failed to analyze small files: {str(e)}"}
