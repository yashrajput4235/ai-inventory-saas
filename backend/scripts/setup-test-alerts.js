require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking DB state...");
  
  // Get an active store
  const store = await prisma.store.findFirst();
  if (!store) {
    console.log("No store found");
    return;
  }
  console.log("Store:", store.name);

  // Get inventory items
  const inventory = await prisma.inventory.findMany({
    where: { storeId: store.id },
    include: { product: true }
  });

  if (inventory.length === 0) {
    console.log("No inventory found.");
    return;
  }

  console.log(`Found ${inventory.length} inventory items.`);

  // Pick top 3 to reduce stock
  const itemsToReduce = inventory.slice(0, 3);
  
  for (const item of itemsToReduce) {
    // 1. Lower inventory to 2
    await prisma.inventory.update({
      where: { id: item.id },
      data: { quantity: 2 }
    });
    console.log(`Reduced ${item.product.name} stock to 2`);

    // 2. Ensure a prediction exists with high demand
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.prediction.upsert({
      where: {
        storeId_productId_predictionDate: {
          storeId: store.id,
          productId: item.productId,
          predictionDate: today
        }
      },
      update: {
        predictedDemand: 45,
        recommendedStock: 55
      },
      create: {
        organizationId: store.organizationId,
        storeId: store.id,
        productId: item.productId,
        predictedDemand: 45,
        recommendedStock: 55,
        predictionDate: today,
        modelVersion: "test-model"
      }
    });
    console.log(`Set predicted demand for ${item.product.name} to 45`);
  }

  console.log("Test data setup complete. Alerts and Reorder should now show these items.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
