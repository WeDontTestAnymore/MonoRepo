import json
from minio import Minio
from urllib.parse import unquote

def get_partition_keys(endpoint: str, access_key: str, secret_key: str, bucket_name: str, hudi_table_path: str):
    """Extracts partition keys from Hudi metadata, commit, deltacommit, and compaction files."""
    try:
        secure = endpoint.startswith("https")
        minio_client = Minio(endpoint.replace("https://", "").replace("http://", ""),
                             access_key=access_key,
                             secret_key=secret_key,
                             secure=secure)

        objects = minio_client.list_objects(bucket_name, f"{hudi_table_path}/.hoodie/", recursive=True)
        files = [obj.object_name for obj in objects]

        partition_files = []

        commit_files = sorted([f for f in files if f.endswith(".commit")], reverse=True)
        deltacommit_files = sorted([f for f in files if f.endswith(".deltacommit")], reverse=True)
        compaction_files = sorted([f for f in files if f.endswith(".compaction")], reverse=True)

        if commit_files:
            partition_files.append(commit_files[0])
        if deltacommit_files:
            partition_files.append(deltacommit_files[0])
        if compaction_files:
            partition_files.append(compaction_files[0])

        metadata_files = [f for f in files if "partition_metadata" in f or f.startswith(".hoodie/metadata/")]
        metadata_files = [f for f in metadata_files if not f.endswith(".crc")]  

        if metadata_files:
            partition_files.append(metadata_files[0])

        
        if len(partition_files) < 3:
            log_files = sorted([f for f in files if ".log." in f], reverse=True)
            partition_files.extend(log_files[:3 - len(partition_files)])

        partitions = set()

        for file in partition_files:
            try:
                obj = minio_client.get_object(bucket_name, file)
                data = obj.read().decode("utf-8")

                
                try:
                    json_data = json.loads(data)
                    if "partitionToWriteStats" in json_data:
                        partitions.update(json_data["partitionToWriteStats"].keys())
                except json.JSONDecodeError:
                    
                    lines = data.splitlines()
                    for line in lines:
                        if "/" in line or "=" in line:  
                            partition_candidate = line.strip()
                            if partition_candidate and partition_candidate != "files":  
                                partitions.add(partition_candidate)

            except Exception as e:
                print(f"Error reading file {file}: {str(e)}")

        return {
            "partitions": list(partitions) if partitions else ["No valid partitions found"]
        }

    except Exception as e:
        return {"error": str(e)}
