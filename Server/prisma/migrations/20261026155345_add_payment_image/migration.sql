/*
  Warnings:

  - You are about to drop the column `image` on the `MenuCategory` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'TAKEN';
ALTER TYPE "OrderStatus" ADD VALUE 'DECLINED';

-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentImage" TEXT;
