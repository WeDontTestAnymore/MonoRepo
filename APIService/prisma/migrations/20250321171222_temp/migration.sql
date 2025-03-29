-- CreateEnum
CREATE TYPE "bucket" AS ENUM ('AWS', 'R2', 'Azure', 'Other');

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "uuid" TEXT NOT NULL,
    "bucket_type" "bucket" NOT NULL,
    "bucket_uri" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "bucket_region" TEXT NOT NULL,
    "bucket_access_key_id" TEXT NOT NULL,
    "bucket_secret_access_key" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
