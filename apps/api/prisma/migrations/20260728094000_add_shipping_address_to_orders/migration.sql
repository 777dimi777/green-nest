/*
  Warnings:

  - Added the required column `shippingCity` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCountry` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFirstName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingLastName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPostalCode` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingStreet` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingStreetNumber` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippingApartment" TEXT,
ADD COLUMN     "shippingCity" TEXT NOT NULL,
ADD COLUMN     "shippingCountry" TEXT NOT NULL,
ADD COLUMN     "shippingFirstName" TEXT NOT NULL,
ADD COLUMN     "shippingLastName" TEXT NOT NULL,
ADD COLUMN     "shippingPhone" TEXT NOT NULL,
ADD COLUMN     "shippingPostalCode" TEXT NOT NULL,
ADD COLUMN     "shippingStreet" TEXT NOT NULL,
ADD COLUMN     "shippingStreetNumber" TEXT NOT NULL;
