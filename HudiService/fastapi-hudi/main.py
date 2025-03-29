from urllib.parse import unquote
from fastapi import FastAPI, Query
from services.schema_service import get_table_schema
from services.partition_service import get_partition_keys
from services.sample_data_service import get_sample_data
from services.key_metrics_service import get_key_metrics
from services.versioning_service import get_versioning_info
from services.small_files_warning_service import detect_small_files
from services.list_tables_service import list_tables

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to Hudi Metastore API"}



@app.get("/schema")
def schema(
    endpoint: str = Query(..., description="MinIO/S3 endpoint"),
    access_key: str = Query(..., description="MinIO/S3 access key"),
    secret_key: str = Query(..., description="MinIO/S3 secret key"),
    bucket_name: str = Query(..., description="S3 Bucket name"),
    hudi_table_path: str = Query(..., description="Hudi table path")
):
   
    return get_table_schema(
        unquote(endpoint), unquote(access_key), unquote(secret_key), unquote(bucket_name), unquote(hudi_table_path)
    )


@app.get("/partitions")
def partitions(
    endpoint: str = Query(..., description="MinIO/S3 endpoint"),
    access_key: str = Query(..., description="MinIO/S3 access key"),
    secret_key: str = Query(..., description="MinIO/S3 secret key"),
    bucket_name: str = Query(..., description="S3 Bucket name"),
    hudi_table_path: str = Query(..., description="Hudi table path")
):
    
    return get_partition_keys(
        unquote(endpoint), access_key, unquote(secret_key), bucket_name, unquote(hudi_table_path)
    )


@app.get("/sample-data")
def sample_data(
    endpoint: str = Query(..., description="MinIO/S3 endpoint"),
    access_key: str = Query(..., description="MinIO/S3 access key"),
    secret_key: str = Query(..., description="MinIO/S3 secret key"),
    bucket_name: str = Query(..., description="S3 Bucket name"),
    hudi_table_path: str = Query(..., description="Hudi table path"),
    row_limit: int = Query(10, description="Limit the number of rows in the sample data")  # Default is 10
):
    return get_sample_data(unquote(endpoint), unquote(access_key), unquote(secret_key), unquote(bucket_name), unquote(hudi_table_path), row_limit)

@app.get("/key-metrics")
def key_metrics(
    endpoint: str = Query(..., description="MinIO/S3 endpoint"),
    access_key: str = Query(..., description="MinIO/S3 access key"),
    secret_key: str = Query(..., description="MinIO/S3 secret key"),
    bucket_name: str = Query(..., description="S3 Bucket name"),
    hudi_table_path: str = Query(..., description="Hudi table path")
):
    return get_key_metrics(unquote(endpoint), unquote(access_key), unquote(secret_key), unquote(bucket_name), unquote(hudi_table_path))



@app.get("/tables")
def get_tables(
    endpoint: str = Query(...),
    access_key: str = Query(...),
    secret_key: str = Query(...),
    bucket_name: str = Query(...)
):
    return list_tables(
        unquote(endpoint),
        unquote(access_key),
        unquote(secret_key),
        unquote(bucket_name)
    )



@app.get("/versioning")
def versioning(
    endpoint: str = Query(...),
    access_key: str = Query(...),
    secret_key: str = Query(...),
    bucket_name: str = Query(...),
    hudi_table_path: str = Query(...)
):
    return get_versioning_info(
        unquote(endpoint),
        unquote(access_key),
        unquote(secret_key),
        unquote(bucket_name),
        unquote(hudi_table_path)
    )

@app.get("/small-files-warning")
def small_files_warning(
    endpoint: str = Query(..., description="MinIO/S3 endpoint"),
    access_key: str = Query(..., description="MinIO/S3 access key"),
    secret_key: str = Query(..., description="MinIO/S3 secret key"),
    bucket_name: str = Query(..., description="S3 Bucket name"),
    hudi_table_path: str = Query(..., description="Hudi table path"),
):
    return detect_small_files(unquote(endpoint), access_key, unquote(secret_key), bucket_name, hudi_table_path)
