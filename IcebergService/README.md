{
  "schema": [
    {
      "name": "userid",
      "type": "string",
      "required": false
    },
    {
      "name": "salary",
      "type": "int",
      "required": false
    },
    {
      "name": "organization",
      "type": "string",
      "required": false
    },
    {
      "name": "yearsOfExperience",
      "type": "int",
      "required": false
    },
    {
      "name": "joinedAt",
      "type": "timestamp",
      "required": false
    }
  ],
  "partitionSpec": [
    {
      "name": "organization",
      "transform": "identity"
    }
  ],
  "sortOrder": [],
  "schemaId": 0,
  "formatVersion": 2
}
