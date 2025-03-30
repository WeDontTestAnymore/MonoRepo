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
    {
    "config":{
        "key":"adityaaparadh",
        "secret":"TN9Z55pOnU%3rc",
        "endpoint":"s3.aditya.software"
    },
    "tables3uri":"s3://datalake/employment/employment.parquet" 
}
}
```

## Example Request Body

```json
{
    {
    "schema": [
        {
            "column_name": "userid",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "salary",
            "column_type": "INTEGER",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "organization",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "yearsOfExperience",
            "column_type": "INTEGER",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "joinedAt",
            "column_type": "TIMESTAMP",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        }
    ]
}
}


