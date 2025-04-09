# IcebergService

A service for interacting with Apache Iceberg table metadata through a REST API interface.

## Overview

IcebergService provides a set of REST endpoints to query and explore Apache Iceberg table metadata. This service allows applications to access Iceberg's metadata features including:

- Schema information
- Table properties
- Version history
- Key metrics
- Snapshot management

## Project Structure

```
IcebergService/
├── controllers/      # Request handlers
├── routes/           # API route definitions
├── utils/            # Utility functions
├── .gitignore        # Git ignore file
├── gitkeep           # Empty file to maintain directory structure
├── package-lock.json # Dependency lock file
├── package.json      # Project configuration
├── README.md         # Project documentation
└── server.js         # Main application entry point
```

## API Endpoints

### Schema Operations

- `POST /api/schema/details` 

example

```json
{
  "config": {
    "key": "minio",
    "secret": "minio123",
    "endpoint": "127.0.0.1:9000"
  },
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

```json
{
  "schema": [
    {
      "id": "1",
      "name": "c_custkey",
      "required": false,
      "type": "long"
    },
    {
      "id": "2",
      "name": "c_name",
      "required": false,
      "type": "string"
    }
  ],
  "partitionDetails": [
    {
      "name": "c_nationkey",
      "transform": "identity",
      "source-id": "4",
      "field-id": "1000"
    }
  ]
}
```


- `POST /api/schema/sampleData`

example 

```json
{
  "config": {
    "key": "minio",
    "secret": "minio123",
    "endpoint": "127.0.0.1:9000"
  },
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

```json
{
  "sampleData": [
    {
      "c_custkey": "1144",
      "c_name": "Customer#000001144",
      "c_address": "DGLUWG9evYLNbYhOXVzqZ LdfIMVfBjDf",
      "c_nationkey": "1",
      "c_phone": "11-336-453-4489",
      "c_acctbal": 4189.04,
      "c_mktsegment": "BUILDING",
      "c_comment": " ideas. even, regular excuses after the ironic requests cajole blithe"
    },
    {
      "c_custkey": "1183",
      "c_name": "Customer#000001183",
      "c_address": "qdIqRUfpmvtWo0NGsyi4qyjkwzlImP9,NrSC",
      "c_nationkey": "1",
      "c_phone": "11-968-244-9275",
      "c_acctbal": 4455.76,
      "c_mktsegment": "BUILDING",
      "c_comment": "arefully regular dependencies. quick"
    },
    {
      "c_custkey": "1234",
      "c_name": "Customer#000001234",
      "c_address": "B3OhbH0MRJE,F0Lc7Jq0Ttv3",
      "c_nationkey": "1",
      "c_phone": "11-742-434-6436",
      "c_acctbal": -982.32,
      "c_mktsegment": "FURNITURE",
      "c_comment": "y ironic instructions are quickly about the slyly silent pinto beans. quickly final dependenci"
    }
  ]
}
```

### Properties Operations

- `GET /api/properties` - Get table properties

### Version Operations

- `POST /api/versions/all` - Get table version history

example

```json
{
  "config": {
    "key": "minio",
    "secret": "minio123",
    "endpoint": "127.0.0.1:9000"
  },
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

```json
{
  "allVersionSchemas": [
    [
      {
        "id": "1",
        "name": "c_custkey",
        "required": false,
        "type": "long"
      },
      {
        "id": "2",
        "name": "c_name",
        "required": false,
        "type": "string"
      }
    ],
    [
      {
        "id": "1",
        "name": "c_custkey",
        "required": false,
        "type": "long"
      },
      {
        "id": "2",
        "name": "c_name",
        "required": false,
        "type": "string"
      },
      {
        "id": "3",
        "name": "c_address",
        "required": false,
        "type": "string"
      }
    ]
  ]
}
```

### Key Metrics

- `POST /api/keyMetrics/fileData`

example

```json
{
  "config": {
    "key": "minio",
    "secret": "minio123",
    "endpoint": "127.0.0.1:9000"
  },
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

`size_bytes` will not be needed as `file_size` already is in human-readable format, but it is neccessary to calculate the total size

```json

  {
  "fileData": [
    {
      "row_count": "59",
      "partition": {
        "c_nationkey": "1"
      },
      "size_bytes": "5487",
      "file_path": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c/data/c_nationkey=1/20250409_074917_00004_jt64p-25a53cd2-8580-4122-bb34-28e373c076f8.parquet"
    },
    {
      "row_count": "69",
      "partition": {
        "c_nationkey": "3"
      },
      "size_bytes": "6092",
      "file_path": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c/data/c_nationkey=3/20250409_074917_00004_jt64p-75163d0d-1020-4392-87e8-adb8c1c71a43.parquet"
    }
  ],
  "totalRows": 1500,
  "totalFileSize": "135.54 KB"
}

```

- `POST /api/keyMetrics/overhead`

**for smaller data, there may be many or mostly all files. Try limiting it if using it in frontend**

example

```json
{
  "config": {
    "key": "minio",
    "secret": "minio123",
    "endpoint": "127.0.0.1:9000"
  },
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

```json
{
  "overheadData": [
    {
      "filePath": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c/data/c_nationkey=1/20250409_074917_00004_jt64p-25a53cd2-8580-4122-bb34-28e373c076f8.parquet",
      "filesize": "5.36 KB"
    },
    {
      "filePath": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c/data/c_nationkey=3/20250409_074917_00004_jt64p-75163d0d-1020-4392-87e8-adb8c1c71a43.parquet",
      "filesize": "5.95 KB"
    }
  ]
}
```


### Snapshot Operations

- `POST /api/snapshots/show` - Get table snapshots

example

```json
{
  "config": {
    "key": "minio",
    "secret": "minio123",
    "endpoint": "127.0.0.1:9000"
  },
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

```json
{
  "snapshots": [
    {
      "snapshot_id": "424240939754004229",
      "timestamp_ms": "2025-04-09 07:49:18.288",
      "added_rows_count": "1500",
      "deleted_rows_count": "0"
    }
  ]
}
```

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Start the service:

   ```
   npm start
   ```

   For development with auto-restart:

   ```
   npm run dev
   ```

## Requirements

- Node.js 16+
- Access to Iceberg tables on S3, HDFS, or local filesystem

#
