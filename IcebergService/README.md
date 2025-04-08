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

- `GET /api/versions` - Get table version history

### Key Metrics

- `GET /api/keyMetrics` - Get table performance metrics

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

