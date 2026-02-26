/*
  Warnings:

  - You are about to drop the column `lowStockThreshold` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lowStockThreshold";
