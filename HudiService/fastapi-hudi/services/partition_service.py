import os
import json
from minio import Minio
from minio.error import S3Error
import pyarrow.parquet as pq
from io import BytesIO

def list_hudi_partitions(endpoint, access_key, secret_key, bucket_name, hudi_table_path):
    client = Minio(
        endpoint.replace("https://", "").replace("http://", ""),
        access_key=access_key,
        secret_key=secret_key,
        secure=endpoint.startswith("https")
    )

    partitions = {}
    metadata_rows = {}  

    try:
        objects = client.list_objects(bucket_name, prefix=hudi_table_path, recursive=True)

        for obj in objects:
            if obj.is_dir:
                continue  

            partition_path = os.path.dirname(obj.object_name)
            partition_keys = partition_path.replace(hudi_table_path, "").strip("/").split("/")
            partition_key = "/".join(partition_keys)  

            
            if partition_path not in partitions:
                partitions[partition_path] = {
                    "partition": partition_path,
                    "partitionKey": partition_key,
                    "commitTime": "N/A",
                    "totalSizeMB": 0,
                    "totalRows": 0,
                    "rowGroups": 0,
                    "rowGroupDetails": []
                }

           
            partitions[partition_path]["totalSizeMB"] += obj.size / (1024 * 1024)

            
            if ".hoodie/metadata/.hoodie" in obj.object_name and (obj.object_name.endswith(".commit") or obj.object_name.endswith(".deltacommit")):
                try:
                    metadata_obj = client.get_object(bucket_name, obj.object_name)
                    raw_metadata = metadata_obj.read().decode("utf-8")
                    metadata_obj.close()
                    metadata_obj.release_conn()

                    commit_data = parse_commit_file(raw_metadata)

                    if commit_data:
                        metadata_rows[partition_path] = commit_data.get("totalRows", 0)
                        partitions[partition_path]["commitTime"] = commit_data.get("commitTime", "N/A")

                except Exception:
                    pass  

            
            if obj.object_name.endswith(".parquet"):
                try:
                    parquet_obj = client.get_object(bucket_name, obj.object_name)
                    parquet_bytes = BytesIO(parquet_obj.read())
                    parquet_file = pq.ParquetFile(parquet_bytes)

                    num_row_groups = parquet_file.num_row_groups
                    partitions[partition_path]["rowGroups"] += num_row_groups

                    row_group_info = []
                    for i in range(num_row_groups):
                        rg_metadata = parquet_file.metadata.row_group(i)
                        row_group_info.append({
                            "rowGroupIndex": i,
                            "numRows": rg_metadata.num_rows,
                            "sizeMB": rg_metadata.total_byte_size / (1024 * 1024)
                        })

                    partitions[partition_path]["rowGroupDetails"].extend(row_group_info)

                except Exception:
                    pass  

        
        for partition, data in partitions.items():
            if partition in metadata_rows:
                partitions[partition]["totalRows"] = metadata_rows[partition]

        return {"partitions": list(partitions.values())}

    except S3Error as e:
        return {"error": str(e)}

def parse_commit_file(raw_metadata):
    
    try:
        commit_data = json.loads(raw_metadata)
        return {
            "commitTime": commit_data.get("commitTime", "N/A"),
            "totalRows": commit_data.get("totalRecordsWritten", 0)
        }
    except Exception:
        return None
