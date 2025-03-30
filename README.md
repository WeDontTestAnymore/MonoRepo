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
