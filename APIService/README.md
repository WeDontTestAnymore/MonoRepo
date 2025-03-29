# API Server

To install dependencies:
```bash
bun install
```

To run live development server (bring your own external dependencies):
```bash
bun run dev
```

---

## Docker Compose

Bring the entire system online with little effort.

Make sure `docker` and `docker-compose` plugin are installed.

Also, the following ports should be free (or modify `compose.yml` as required):
- 3000 [backend]
- 5432 [postgres]
- 8080 [db-adminer]
- 9000 [minio s3]
- 9001 [minio-ui]

Run:

```
docker-compose up --build
```

Wait till you see this log from `api_backend` service
```
INFO: [Server started at 3000]
```

- You can login to the minio instance (AWS CLI, or GUI at port 9001) with credentials: *minioadmin:minioadmin*.

- You can access the postgres instance with `psql` on `localhost:5432`, or with *db-adminer* GUI on `localhost:8080`. Credentials are *root:123*

---

## API Documentation


#### `POST` /auth/login
Can be used to register a session with the backend.

Data format:
```
{
    "bucket_name": "abc",
    "bucket_region" : "ap-south-1",
    "bucket_type": "Other",
    "bucket_uri" : "http://minio:9000",
    "bucket_access_key_id" : "minioadmin",
    "bucket_secret_access_key" : "minioadmin"
}
```

#### `POST` /bucket/scan

Can be used to scan the bucket for tables.

Data format:
```
{
  "maxDepth": 3
}
```

Example return:
```
{
	"tables": [
		{
			"type": "ICEBERG",
			"path": "s3://datalake/iceberg/users/"
		},
		{
			"type": "DELTA",
			"path": "s3://datalake/delta/employment/"
		}
	]
```
