const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const ORG_ID = "7787d6bc-85cf-4bb3-9cef-6ca13755ab5b";
const STORES = [
  "7f09b130-9863-4748-bff4-5ab767c9c185", // Jaipur
  "a517038b-97c7-417b-a2a2-f883daf6081f", // Delhi
  "53629fcc-b141-4f71-8b45-2710e70d5c6a"  // Test Branch B
];

const CATEGORIES = ["Electronics", "Home & Kitchen", "Apparel", "Sports", "Books", "Office Supplies"];

async function main() {
  console.log("Starting bulk product creation...");
  
  for (let i = 1; i <= 60; i++) {
    const storeId = STORES[(i - 1) % STORES.length];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const price = parseFloat((Math.random() * (500 - 10) + 10).toFixed(2));
    const cost = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
    const quantity = Math.floor(Math.random() * 150) + 10;
    const name = `Product ${i} (${category})`;
    const sku = `SKU-${category.substring(0,3).toUpperCase()}-${i.toString().padStart(3, '0')}`;

    try {
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name,
            sku,
            category,
            price,
            cost,
            organizationId: ORG_ID
          }
        });

        const inventory = await tx.inventory.create({
          data: {
            productId: product.id,
            storeId: storeId,
            quantity: quantity,
            lowStockThreshold: 15
          }
        });

        await tx.inventoryLedger.create({
          data: {
            organizationId: ORG_ID,
            storeId: storeId,
            productId: product.id,
            changeType: "STOCK_ADD",
            quantityChange: quantity,
            resultingQty: quantity,
            createdBy: "SYSTEM_QA"
          }
        });
      });
      if (i % 10 === 0) console.log(`Created ${i} products...`);
    } catch (err) {
      console.error(`Failed to create product ${i}:`, err.message);
    }
  }
  
  console.log("Bulk product creation finished!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
