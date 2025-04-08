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

- `POST /api/schema` - Get table schema information

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

- `POST /api/keyMetrics/fileData` - Get table performance metrics

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

size_bytes will not be needed as file_size already is in human-readable format, but it is neccessary to calculate total size

```json
{
  "fileData": [
    {
      "file_path": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568/data/c_nationkey=1/20250408_130821_00004_j6i6p-639746bf-4f05-43a7-b7c6-e0c8386ee549.parquet",
      "row_count": "472",
      "size_bytes": "4385",
      "file_size": "4.28 KB"
    },
    {
      "file_path": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568/data/c_nationkey=3/20250408_130821_00004_j6i6p-910f78da-d956-4ab4-ac21-f233e5ae3522.parquet",
      "row_count": "552",
      "size_bytes": "4999",
      "file_size": "4.88 KB"
    }
  ],
  "totalRows": 12000,
  "totalFileSize": "108.34 KB"
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
      "sequence_number": "1",
      "snapshot_id": "7539855243087200788",
      "timestamp_ms": "2025-04-08 13:08:21.766",
      "manifest_list": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568/metadata/snap-7539855243087200788-1-549de57f-61cb-43dd-bd56-233a30e6e73c.avro"
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

