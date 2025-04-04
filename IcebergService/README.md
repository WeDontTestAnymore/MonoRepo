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

- `GET /api/schema` - Get table schema information

### Properties Operations

- `GET /api/properties` - Get table properties

### Version Operations

- `GET /api/versions` - Get table version history

### Key Metrics

- `GET /api/keyMetrics` - Get table performance metrics

### Snapshot Operations

- `GET /api/snapshots` - Get table snapshots

## Example Requests

### Get Schema

```
GET /api/schema?tableLocation=s3://path/to/iceberg/table
```

### Get Snapshots

```
GET /api/snapshots?tableLocation=s3://path/to/iceberg/table
```

### Get Table Properties

```
GET /api/properties?tableLocation=s3://path/to/iceberg/table
```

## Example Response

```json
{
  "schema": [
    {"name": "userid", "type": "string", "required": false},
    {"name": "salary", "type": "int", "required": false},
    {"name": "organization", "type": "string", "required": false},
    {"name": "yearsOfExperience", "type": "int", "required": false},
    {"name": "joinedAt", "type": "timestamp", "required": false}
  ],
  "partitionSpec": [
    {"name": "organization", "transform": "identity"}
  ],
  "sortOrder": [],
  "schemaId": 0,
  "formatVersion": 2
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

## Configuration

Configure your storage backend in the request or through environment variables:

```json
{
  "config": {
    "key": "your-access-key",
    "secret": "your-secret-key",
    "endpoint": "s3.example.com"
  },
  "tableLocation": "s3://bucket/path/to/table"
}
```

## Features

- **Read-only metadata exploration**: Safe, non-destructive exploration of Iceberg tables
- **Snapshot inspection**: View historical versions of table data and metadata
- **Schema inspection**: Examine current and historical schema definitions
- **Key metrics**: Get statistics and performance insights for Iceberg tables
- **Version history**: Track changes to table definitions over time
