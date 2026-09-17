ALTER TABLE "products"
ADD COLUMN "latinName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "plantType" TEXT NOT NULL DEFAULT '',
ADD COLUMN "trunkCircumference" TEXT,
ADD COLUMN "graftHeight" TEXT,
ADD COLUMN "potDiameter" TEXT;

ALTER TABLE "products"
DROP COLUMN "potSize",
DROP COLUMN "light",
DROP COLUMN "watering",
DROP COLUMN "temperature",
DROP COLUMN "humidity",
DROP COLUMN "difficulty",
DROP COLUMN "growthRate",
DROP COLUMN "origin",
DROP COLUMN "toxicity",
DROP COLUMN "airPurifying",
DROP COLUMN "petFriendly";

ALTER TABLE "products"
ALTER COLUMN "latinName" DROP DEFAULT,
ALTER COLUMN "plantType" DROP DEFAULT;
