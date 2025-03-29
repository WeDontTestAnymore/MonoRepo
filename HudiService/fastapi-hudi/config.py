from pyspark.sql import SparkSession

def create_spark_session(endpoint, access_key, secret_key):
    """Creates and returns a new Spark session dynamically for each request."""
    return SparkSession.builder \
        .appName("Hudi Metadata Retrieval") \
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \
        .config("spark.sql.extensions", "org.apache.spark.sql.hudi.HoodieSparkSessionExtension") \
        .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.hudi.catalog.HoodieCatalog") \
        .config("spark.hadoop.fs.s3a.endpoint", endpoint) \
        .config("spark.hadoop.fs.s3a.access.key", access_key) \
        .config("spark.hadoop.fs.s3a.secret.key", secret_key) \
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
        .config("spark.hadoop.fs.s3a.path.style.access", "true") \
        .config("spark.jars", "/home/om/github/hudi-tables/hudi-spark3.4-bundle_2.12-0.14.0.jar") \
        .getOrCreate()
