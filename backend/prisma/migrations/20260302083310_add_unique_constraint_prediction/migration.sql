/*
  Warnings:

  - A unique constraint covering the columns `[storeId,productId,predictionDate]` on the table `Prediction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prediction_storeId_productId_predictionDate_key" ON "Prediction"("storeId", "productId", "predictionDate");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
