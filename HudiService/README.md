# FastAPI Hudi API

This is a FastAPI backend service for interacting with Hudi tables stored in S3.

## Setup

### Install Dependencies

```sh
pip install -r requirements.txt
```

### Navigate to the Project Directory

```sh
cd Fastapi-hudi
```

### Start the Server

```sh
uvicorn main:app --reload
```

The server will start by default at `http://localhost:8000`

---

## API Endpoints

### 1. Generic API

**Endpoint:**  
`GET http://localhost:8000/`

---

### 2. Versioning

**Endpoint:**  
`GET http://127.0.0.1:8000/versioning`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`
- `hudi_table_path=hudi_large_table`

---

### 3. Schema Extraction

**Endpoint:**  
`GET http://localhost:8000/schema`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`
- `hudi_table_path=hudi_large_table`

---

### 4. Partitions Details

**Endpoint:**  
`GET http://127.0.0.1:8000/partitions`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`
- `hudi_table_path=hudi_large_table`

---

### 5. Sample Data Extraction

**Endpoint:**  
`GET http://127.0.0.1:8000/sample-data`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`
- `hudi_table_path=hudi_large_table`
- `row_limit=10`

---

### 6. Key Metrics

**Endpoint:**  
`GET http://127.0.0.1:8000/key-metrics`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`
- `hudi_table_path=hudi_large_table`

---

### 7. Small Files Warning

**Endpoint:**  
`GET http://127.0.0.1:8000/small-files-warning`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`
- `hudi_table_path=hudi_large_table`

---

### 8. Fetch Table Names

**Endpoint:**  
`GET http://127.0.0.1:8000/tables`

**Query Parameters:**
- `endpoint=https://s3.your-endpoint.com`
- `access_key=your-access-key`
- `secret_key=your-secret-key`
- `bucket_name=datalake`

---

## Example Query Parameters

```txt
endpoint=https://s3.aditya.software
access_key=adityaaparadh
secret_key=TN9Z55pOnU%3rc
bucket_name=datalake
hudi_table_path=hudi_large_table
```

Replace these values with your actual credentials and Hudi table details.
