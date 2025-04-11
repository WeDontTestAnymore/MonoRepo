# MetaLens

A web based Meta store viewer, which can access and analyse huge metadata from Parquet,Hudi,Iceberg and Delta table formats, without registering them on a catalog.
Users can just enter a s3 location and its details and get access to Metalens with a click


To run all the services :

```bash
docker compose up
```

Default Frontend port : 5173
Default Backend port : 3000

The main API backend service explores the object store, identifies table formats and manages requests and responses from and to the indiividual table microservices.
Since everything is containerised, it allows us to scale indepedent services independently.

Tech stack : Docker,Python,FastAPI, Node,Express,PostGres and Node

OpenSource libraries : aws sdk for js and boto3  for python, DuckDB js package, Shadcn and MagicUI for UI,axios,pyarrow, FastAvro,PySpark

Refer to individual service directories for corresponding microservice documentation

### For OpenAPI Doc

```
1.npm install -g swagger-ui-watcher
2.swagger-ui-watcher openapi.yaml
3.redocly preview-docs openapi.yaml
```

# API DOCUMENTATION

# API Documentation Index

## Apache Iceberg Tables

- [Schema Operations](#schema-operations)
  - [POST /iceberg/schema/details](#post-icebergschemadetails)
  - [POST /iceberg/schema/sampleData](#post-icebergschemasampledata)
- [Properties Operations](#properties-operations)
  - [POST /iceberg/properties/show](#post-icebergpropertiesshow)
  - [POST /iceberg/properties/manifestFiles](#post-icebergpropertiesmanifestfiles)
- [Version Operations](#version-operations)
  - [POST /iceberg/versions/all](#post-icebergversionsall)
- [Key Metrics](#key-metrics)
  - [POST /iceberg/keyMetrics/fileData](#post-icebergkeymetricsfiledata)
  - [POST /iceberg/keyMetrics/overhead](#post-icebergkeymetricsoverhead)
- [Snapshot Operations](#snapshot-operations)
  - [POST /iceberg/snapshots/show](#post-icebergsnapshotsshow)

## Apache Iceberg Tables 


### Schema Operations

- `POST /iceberg/schema/details` 



```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```
Response:
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


- `POST /iceberg/schema/sampleData`

example 

```json
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

Response:
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

- `POST /iceberg/properties/show` 

example

```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c"
}
```

```json
{
  "tableFormat": "iceberg",
  "storageLocation": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c"
}
```

- `POST /iceberg/properties/manifestFiles`

example

```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c"
}
```
Response:

```json
{
  "manifestFiles": [
    {
      "manifest_path": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c/metadata/41bd73f3-96d4-4371-ac5d-446c69292f38-m0.avro"
    },
    {
      "manifest_path": "s3://warehouse/customer_iceberg-6ef6d4e1ad0949c6a08a4af59466cc4c/metadata/41bd73f3-96d4-4371-ac5d-446c69292f38-m0.avro"
    }
  ]
}
```

### Version Operations

- `POST /iceberg/versions/all` - Get table version history

example


```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```
Response:

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

- `POST /iceberg/keyMetrics/fileData`

example

```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

`size_bytes` will not be needed as `file_size` already is in human-readable format, but it is neccessary to calculate the total size

Response:
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

- `POST /iceberg/keyMetrics/overhead`

**for smaller data, there may be many or mostly all files. Try limiting it if using it in frontend**

example

```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```
R
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

- `POST /iceberg/snapshots/show` - Get table snapshots

example

```json
{
  "icebergPath": "s3://warehouse/customer_iceberg-1723663fcb954561ab5c9529bc709568"
}
```

Response:

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


