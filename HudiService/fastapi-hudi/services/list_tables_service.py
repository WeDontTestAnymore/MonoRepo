from minio import Minio
from urllib.parse import unquote

def list_tables(endpoint, access_key, secret_key, bucket_name):
    """
    Lists all potential tables at the root level of the given bucket.
    Identifies Hudi (by `.hoodie/`), Delta (by `_delta_log/`), and Iceberg (by `metadata/`).
    """
    try:
        secure = endpoint.startswith("https")
        minio_client = Minio(unquote(endpoint.replace("https://", "").replace("http://", "")),
                             access_key=unquote(access_key),
                             secret_key=unquote(secret_key),
                             secure=secure)

        objects = list(minio_client.list_objects(unquote(bucket_name), recursive=True))

        
        table_candidates = set(obj.object_name.split("/")[0] for obj in objects if "/" in obj.object_name)

        table_info = {}

        for table in table_candidates:
            types = set()

            for obj in objects:
                if obj.object_name.startswith(f"{table}/"):
                    if ".hoodie/" in obj.object_name:
                        types.add("Hudi")
                    if "_delta_log/" in obj.object_name:
                        types.add("Delta")
                    if "metadata/" in obj.object_name:
                        types.add("Iceberg")

            table_info[table] = list(types)

        
        table_list = [{"table_name": table, "types": types} for table, types in table_info.items()]
        return {"tables": table_list}

    except Exception as e:
        return {"error": unquote(str(e))}
