from minio import Minio


minio_client = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False
)


def list_metadata_files(bucket_name):
    objects = minio_client.list_objects(bucket_name, recursive=True)
    return [obj.object_name for obj in objects if ".hoodie" in obj.object_name]


def get_object_content(bucket_name, object_name):
    response = minio_client.get_object(bucket_name, object_name)
    return response.read()
