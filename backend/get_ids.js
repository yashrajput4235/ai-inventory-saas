const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "vaibhavyash001@gmail.com" },
    include: { organization: true }
  });
  
  if (!user) {
    console.log("Admin user not found.");
    return;
  }
  
  const stores = await prisma.store.findMany({
    where: { organizationId: user.organizationId }
  });
  
  console.log("ORG_ID:", user.organizationId);
  console.log("STORES:", JSON.stringify(stores, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
