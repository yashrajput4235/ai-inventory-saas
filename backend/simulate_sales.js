const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const ORG_ID = "b3f49293-78a4-4d80-8786-ba8b7e08f808";

async function main() {
  console.log("Fetching products and stores...");
  const products = await prisma.product.findMany({ where: { organizationId: ORG_ID } });
  const inventories = await prisma.inventory.findMany({ 
    where: { product: { organizationId: ORG_ID } } 
  });

  if (products.length === 0 || inventories.length === 0) {
    console.log("No data to simulate sales.");
    return;
  }

  console.log(`Starting simulation of 250 sales...`);
  
  for (let i = 1; i <= 250; i++) {
    // Pick a random inventory record (which ties a product to a store)
    const inv = inventories[Math.floor(Math.random() * inventories.length)];
    const product = products.find(p => p.id === inv.productId);
    
    // Pick a random date in the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const soldAt = new Date();
    soldAt.setDate(soldAt.getDate() - daysAgo);
    soldAt.setHours(soldAt.getHours() - hoursAgo);

    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 units
    const totalAmount = quantity * product.price;
    const profit = totalAmount - (quantity * (product.cost || 0));

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Create Sale
        await tx.sale.create({
          data: {
            organizationId: ORG_ID,
            storeId: inv.storeId,
            productId: product.id,
            quantity: quantity,
            priceAtSale: product.price,
            costAtSale: product.cost,
            totalAmount: totalAmount,
            profit: profit,
            soldAt: soldAt
          }
        });

        // 2. Update Inventory
        // Note: Realistically, historical sales shouldn't deduct *current* inventory 
        // if we are just "filling history". But for this test, we want to see 
        // current stock go down so the "Low Stock" alerts trigger.
        await tx.inventory.update({
          where: { id: inv.id },
          data: { quantity: { decrement: quantity } }
        });

        // 3. Ledger
        await tx.inventoryLedger.create({
          data: {
            organizationId: ORG_ID,
            storeId: inv.storeId,
            productId: product.id,
            changeType: "SALE",
            quantityChange: -quantity,
            resultingQty: 0, // Simplified for simulation
            createdBy: "SYSTEM_QA",
            createdAt: soldAt
          }
        });
      });
      
      if (i % 50 === 0) console.log(`Simulated ${i} sales...`);
    } catch (err) {
      console.error(`Failed sale ${i}:`, err.message);
    }
  }

  console.log("Sales simulation finished successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
