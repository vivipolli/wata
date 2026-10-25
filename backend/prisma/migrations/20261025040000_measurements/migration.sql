-- Water-quality measurements from official sources, and the monitoring station of each agreement.

-- AlterTable
ALTER TABLE "agreements" ADD COLUMN "station_code" TEXT;

-- CreateTable
CREATE TABLE "measurements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "station_code" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "value" REAL,
    "unit" TEXT NOT NULL,
    "qualifier" TEXT,
    "sampled_at" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "source_ref" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "measurements_station_code_sampled_at_idx" ON "measurements"("station_code", "sampled_at");

-- CreateIndex
CREATE UNIQUE INDEX "measurements_source_source_ref_parameter_key" ON "measurements"("source", "source_ref", "parameter");

