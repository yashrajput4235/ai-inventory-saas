const prisma = require("../config/prisma");

exports.addStock = async (req, res) => {
  try {
    const { storeId, productId, quantity } = req.body;
    const { id: userId, role, organizationId } = req.user;

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // Check store belongs to same organization
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        organizationId,
      },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found in your organization",
      });
    }

    // If manager → check store assignment
    if (role === "manager") {
      const mapping = await prisma.userStore.findFirst({
        where: {
          userId,
          storeId,
        },
      });

      if (!mapping) {
        return res.status(403).json({
          message: "You are not assigned to this store",
        });
      }
    }

    // Transaction
  const result = await prisma.$transaction(async (tx) => {

  const existingInventory = await tx.inventory.findUnique({
    where: {
      storeId_productId: {
        storeId,
        productId,
      },
    },
  });

  let newQuantity;

  if (existingInventory) {
    newQuantity = existingInventory.quantity + quantity;

    await tx.inventory.update({
      where: { id: existingInventory.id },
      data: { quantity: newQuantity },
    });

  } else {
    newQuantity = quantity;

    await tx.inventory.create({
      data: {
        storeId,
        productId,
        quantity: newQuantity,
      },
    });
  }

  // 🔥 Ledger Entry
  await tx.inventoryLedger.create({
    data: {
      organizationId,
      storeId,
      productId,
      changeType: "STOCK_ADD",
      quantityChange: quantity,   // positive
      resultingQty: newQuantity,
      createdBy: userId,
    },
  });

  return { newQuantity };
});

    res.status(200).json({
      message: "Stock added successfully",
      inventory: result,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add stock",
    });
  }
};

exports.getStoreInventory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { id: userId, role, organizationId } = req.user;

    // Verify store exists in org
    const store = await prisma.store.findFirst({
      where: { id: storeId, organizationId }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found in your organization" });
    }

    // Role mapping check
    if (role === "manager") {
      const mapping = await prisma.userStore.findFirst({
        where: { userId, storeId }
      });
      if (!mapping) {
        return res.status(403).json({ message: "You are not assigned to this store" });
      }
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        storeId,
        store: {
          organizationId,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            price: true,
          },
        },
      },
    });

    res.json({ inventory });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch inventory",
    });
  }
};

// update the threshhold
exports.updateThreshold=async(req,res)=>{
  try{
    const {storeId,productId,lowStockThreshold}=req.body;
    const { id: userId, role, organizationId } = req.user;
    // validate threshold
    if(lowStockThreshold<0){
      return res.status(400).json({
        message:"Threshold must be >=0",
      });
    }
    //Validate store belongs to org
    const store=await prisma.store.findFirst({
      where:{
        id:storeId,
        organizationId,
      }
    });
    if(!store){
      return res.status(404).json({
        message: "Store not found in your organization",
      });
    }
    // Manager store scope check
    if (role === "manager") {
      const mapping = await prisma.userStore.findFirst({
        where: { userId, storeId },
      });

    if (!mapping) {
      return res.status(403).json({
        message: "You are not assigned to this store",
      });
    }
  }
  // Validate product belongs to org
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId },
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found in your organization",
      });
    
  }
   // 🔥 UPSERT Inventory
    const inventory = await prisma.inventory.upsert({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
      update: {
        lowStockThreshold,
      },
      create: {
        storeId,
        productId,
        quantity: 0,
        lowStockThreshold,
      },
    });

    res.json({
      message: "Threshold updated successfully",
      inventory,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update threshold",
    });
  }     
}
