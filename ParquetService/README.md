# Parquet Tables API

This is a backend service for parsing Parquet files and returning output as JSON.

## Setup

### Install Dependencies

```sh
npm install
```

### Start the Server

```sh
npm run dev
```

---

## API Endpoints

### 1. Get Schema

**Endpoint:**  
`GET http://localhost:3001/api/schema/show`

---

### 2. Count Row Groups

**Endpoint:**  
`GET http://localhost:3001/api/row-groups-stats/data?action=countRowGroups`

---

### 3. Count Rows

**Endpoint:**  
`GET http://localhost:3001/api/row-groups-stats/data?action=countRows`

---

### 4. Get Statistics

**Endpoint:**  
`GET http://localhost:3001/api/row-groups-stats/data?action=getStats`

---

### 5. Get Range

**Endpoint:**  
`GET http://localhost:3001/api/row-groups-stats/data?action=getRange`

---

## Example Request Body

```json
{
    "config": {
        "key": "your-access-key",
        "secret": "your-secret-key",
        "endpoint": "s3.your-endpoint.com"
    },
    "tables3uri": "s3://your-bucket/your-table.parquet",
    "action": "your-action"
}
```

Replace `"your-action"` with `countRowGroups`, `countRows`, `getStats`, or `getRange` based on the request.

---

## Configuration

Replace `your-access-key`, `your-secret-key`, and `s3.your-endpoint.com` with actual credentials and endpoint.


