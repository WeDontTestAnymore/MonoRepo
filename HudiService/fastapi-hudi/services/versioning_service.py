import json
from minio import Minio
from urllib.parse import unquote

def list_timeline_files(minio_client, bucket_name, hudi_table_path):
    """
    Lists commit & deltacommit files from:
    1. `.hoodie/`
    2. `.hoodie/metadata/.hoodie/`
    """
    try:
        locations = [f"{hudi_table_path}/.hoodie/", f"{hudi_table_path}/.hoodie/metadata/.hoodie/"]
        timeline_files = []

        for path in locations:
            objects = minio_client.list_objects(bucket_name, prefix=path, recursive=True)
            all_files = [obj.object_name for obj in objects]

            
            timeline_files.extend([f for f in all_files if f.endswith(".commit") or f.endswith(".deltacommit")])

        return sorted(timeline_files)  
    except Exception as e:
        return {"error": unquote(str(e))}

def parse_commit_file(minio_client, bucket_name, commit_file):
    """Reads and extracts metadata from a commit/deltacommit file."""
    try:
        obj = minio_client.get_object(bucket_name, commit_file)
        commit_content = obj.read().decode("utf-8")

        
        commit_data = json.loads(commit_content)

        return {
            "commit_file": unquote(commit_file),
            "timestamp": unquote(str(commit_data.get("timestamp"))),
            "operation": unquote(commit_data.get("operation", "Unknown")),
            "total_records": unquote(str(commit_data.get("totalRecordsUpdated", "Unknown"))),
        }
    except Exception as e:
        return None  

def get_versioning_info(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    """
    Fetches versioning info from Hudi timeline (commit files).
    """
    try:
        secure = endpoint.startswith("https")
        minio_client = Minio(unquote(endpoint.replace("https://", "").replace("http://", "")),
                             access_key=unquote(access_key),
                             secret_key=unquote(secret_key),
                             secure=secure)

        
        timeline_files = list_timeline_files(minio_client, unquote(bucket_name), unquote(hudi_table_path))
        if not timeline_files or isinstance(timeline_files, dict):  
            return {"error": unquote("No commit/deltacommit files found")}

        
        version_history = [parse_commit_file(minio_client, unquote(bucket_name), file) for file in timeline_files]
        version_history = [v for v in version_history if v]  

        return {"versioning_info": version_history}
    except Exception as e:
        return {"error": unquote(str(e))}
