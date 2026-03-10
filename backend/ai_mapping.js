const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const ORG_ID = "b3f49293-78a4-4d80-8786-ba8b7e08f808";
const STORES = {
  JAIPUR: "012973f0-5253-4753-b951-99354e33fe06", // Using Main Branch for Jaipur test
  DELHI: "012973f0-5253-4753-b951-99354e33fe06"   // Using Main Branch for Delhi test
};

const AI_IDS = [
  { id: "store1_product2", name: "AI Test Item A (Jaipur)", store: STORES.JAIPUR },
  { id: "store2_product1", name: "AI Test Item B (Delhi)", store: STORES.DELHI },
  { id: "store3_product3", name: "AI Test Item C (Jaipur)", store: STORES.JAIPUR }
];

async function main() {
  console.log("Connecting AI Prediction IDs to Postgres...");
  
  for (const item of AI_IDS) {
    try {
      // 1. Delete if exists (to avoid conflict)
      await prisma.inventory.deleteMany({ where: { productId: item.id } });
      await prisma.product.deleteMany({ where: { id: item.id } });

      // 2. Create Product with EXACT ID from BigQuery
      await prisma.product.create({
        data: {
          id: item.id,
          name: item.name,
          sku: `SKU-AI-${item.id}`,
          category: "AI_TEST",
          price: 99.99,
          cost: 40.00,
          organizationId: ORG_ID
        }
      });

      // 3. Create Inventory
      await prisma.inventory.create({
        data: {
          productId: item.id,
          storeId: item.store,
          quantity: 2, // Very low stock to trigger alerts
          lowStockThreshold: 10
        }
      });

      console.log(`✅ Linked ${item.id} to store ${item.store}`);
    } catch (err) {
      console.error(`❌ Failed ${item.id}:`, err.message);
    }
  }

  // Also verify/create Manager 1 and assign to Jaipur
  const managerEmail = "yashrajput97241@gmail.com";
  const manager = await prisma.user.findUnique({ where: { email: managerEmail } });
  
  if (manager) {
    await prisma.userStore.upsert({
      where: { userId_storeId: { userId: manager.id, storeId: STORES.JAIPUR } },
      update: {},
      create: { userId: manager.id, storeId: STORES.JAIPUR }
    });
    console.log(`✅ Manager ${managerEmail} assigned to Jaipur store`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
