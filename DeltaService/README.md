# Delta Service

To install dependencies:
```bash
bun install
```

To run live development server (bring your own external dependencies):
```bash
bun run dev
```

---

## API Documentation

---

#### `POST` /commits
Get list of delta commit file paths

Data format:
```
{
  "accessKey": "",
  "secretKey": "",
  "region": "ap-south-1",
  "endpoint": "s3.aditya.software",
  "urlStyle": "path",
  "deltaDirectory": "s3://datalake/delta/employment"
}
```
Example Return:

```
{
	"success": true,
	"commits": [
		{
			"fileName": "00000000000000000001.json",
			"version": 1,
			"size": 1056,
			"lastModified": "2025-03-28T14:12:11.162Z",
			"path": "delta/employment/_delta_log/00000000000000000001.json"
		},
		{
			"fileName": "00000000000000000000.json",
			"version": 0,
			"size": 1733,
			"lastModified": "2025-03-28T14:12:01.697Z",
			"path": "delta/employment/_delta_log/00000000000000000000.json"
		}
	],
	"totalCommits": 5,
	"latestCommit": {
			"fileName": "00000000000000000001.json",
			"version": 1,
			"size": 1056,
			"lastModified": "2025-03-28T14:12:11.162Z",
			"path": "delta/employment/_delta_log/00000000000000000001.json"
		},
	"oldestCommit": {
		"fileName": "00000000000000000000.json",
		"version": 0,
		"size": 1733,
		"lastModified": "2025-03-28T14:12:01.697Z",
		"path": "delta/employment/_delta_log/00000000000000000000.json"
	},
	"metadata": {
		"bucket": "datalake",
		"prefix": "delta/employment/_delta_log/",
		"endpoint": "s3.aditya.software"
	}
}
```


---

#### `POST` /schema

Get schema of delta table at a commit

Data format:
```
{
  "accessKey": "",
  "secretKey": "",
  "region": "ap-south-1",
  "endpoint": "s3.aditya.software",
  "urlStyle": "path",
  "fileDirectory": "s3://datalake/delta/employment/_delta_log/00000000000000000004.json"
}
```

Example return:
```
{
	"schema": "{\"type\":\"struct\",\"fields\":[{\"name\":\"userid\",\"type\":\"string\",\"nullable\":true,\"metadata\":{}},{\"name\":\"name\",\"type\":\"string\",\"nullable\":true,\"metadata\":{}},{\"name\":\"age\",\"type\":\"integer\",\"nullable\":true,\"metadata\":{}},{\"name\":\"phone\",\"type\":\"string\",\"nullable\":true,\"metadata\":{}},{\"name\":\"email\",\"type\":\"string\",\"nullable\":true,\"metadata\":{}},{\"name\":\"city\",\"type\":\"string\",\"nullable\":true,\"metadata\":{}},{\"name\":\"state\",\"type\":\"string\",\"nullable\":true,\"metadata\":{}},{\"name\":\"createdAt\",\"type\":\"timestamp\",\"nullable\":true,\"metadata\":{}}]}"
}
```
---

#### `POST` /stats

Get table statistics

Data format:
```
{
  "accessKey": "",
  "secretKey": "",
  "region": "ap-south-1",
  "endpoint": "s3.aditya.software",
  "urlStyle": "path",
  "fileDirectory": "s3://datalake/delta/employment/_delta_log/00000000000000000004.json"
}
```

Output format:
```
{
	"stats": "{\"numRecords\":10000,\"minValues\":{\"userid\":\"000127d3-7a9d-4695-a0e3-543aa9fc\",\"name\":\"Aaron Cassin III\",\"age\":18,\"phone\":\"(200) 330-4479 x846\",\"email\":\"Aaliyah.Beatty@gmail.com\",\"city\":\"Aaliyahbury\",\"state\":\"Alabama\",\"createdAt\":\"2024-03-26T08:55:49.717Z\"},\"maxValues\":{\"userid\":\"fffdb0c1-9d53-4006-80e0-bb8b984e�\",\"name\":\"Zachary Jerde III\",\"age\":65,\"phone\":\"999.616.0509 x515\",\"email\":\"Zula_Donnelly@gmail.com\",\"city\":\"Zulaufton\",\"state\":\"Wyoming\",\"createdAt\":\"2025-03-26T08:38:25.689Z\"},\"nullCount\":{\"userid\":0,\"name\":0,\"age\":0,\"phone\":0,\"email\":0,\"city\":0,\"state\":0,\"createdAt\":0}}"
}
```
