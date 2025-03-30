# IcebergService

A service for interacting with Apache Iceberg tables through a REST API interface.

## Overview

IcebergService provides a set of REST endpoints to manage and query Apache Iceberg tables. This service allows applications to leverage Iceberg's features including:

- Schema evolution
- Time travel
- ACID transactions
- Partition evolution
- Hidden partitioning

## API Endpoints

### Table Operations

- `GET /api/tables` - List all tables
- `GET /api/tables/{tableName}` - Get table details
- `POST /api/tables` - Create a new table
- `DELETE /api/tables/{tableName}` - Drop a table

### Query Operations

- `POST /api/query` - Execute a query against a table
- `GET /api/snapshots/{tableName}` - List table snapshots
- `POST /api/snapshots/{tableName}/rollback` - Rollback to a specific snapshot

### Schema Operations

- `GET /api/schema/{tableName}` - Get table schema
- `PUT /api/schema/{tableName}` - Update table schema

## Example Requests

### Create Table

```json
POST /api/tables
{
  "name": "employment",
  "location": "s3://datalake/employment/",
  "schema": [
    {"name": "userid", "type": "string", "required": false},
    {"name": "salary", "type": "int", "required": false},
    {"name": "organization", "type": "string", "required": false},
    {"name": "yearsOfExperience", "type": "int", "required": false},
    {"name": "joinedAt", "type": "timestamp", "required": false}
  ],
  "partitionBy": ["organization"]
}
```

### Query Data

```json
POST /api/query
{
  "table": "employment",
  "columns": ["userid", "salary", "organization"],
  "filter": "salary > 100000",
  "limit": 100
}
```

## Configuration

The service can be configured to connect to various storage backends:

```json
{
  "storage": {
    "type": "s3",
    "properties": {
      "endpoint": "s3.example.com",
      "access-key": "your-access-key",
      "secret-key": "your-secret-key"
    }
  },
  "catalog": {
    "type": "hms",
    "uri": "thrift://hms-host:9083"
  }
}
```

## Setup

1. Install dependencies: `npm install`
2. Configure your storage backend in `config.json`
3. Start the service: `npm start`

## Requirements

- Node.js 16+
- Access to S3, HDFS, or local filesystem
