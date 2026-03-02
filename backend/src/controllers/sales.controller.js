const prisma = require("../config/prisma");

exports.createSale = async (req, res) => {
  try {
    const { storeId, productId, quantity } = req.body;
    const { userId, role, organizationId } = req.user;

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // ✅ Check store belongs to organization
    const store = await prisma.store.findFirst({
      where: { id: storeId, organizationId },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found in your organization",
      });
    }

    // ✅ Manager store assignment check
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

    // ✅ Check product belongs to organization
    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in your organization",
      });
    }

    // ✅ Single Transaction (FIXED)
    const sale = await prisma.$transaction(async (tx) => {
      
      // 🔥 Atomic decrement
      const updatedInventory = await tx.inventory.updateMany({
        where: {
          storeId,
          productId,
          quantity: {
            gte: quantity,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      if (updatedInventory.count === 0) {
        throw new Error("Insufficient stock");
      }

      // Fetch updated inventory
      const inventory = await tx.inventory.findUnique({
        where: {
          storeId_productId: {
            storeId,
            productId,
          },
        },
      });

      const priceAtSale = product.price;
      const costAtSale = product.cost || 0;
      const totalAmount = priceAtSale * quantity;
      const profit = (priceAtSale - costAtSale) * quantity;

      const createdSale = await tx.sale.create({
        data: {
          organizationId,
          storeId,
          productId,
          quantity,
          priceAtSale,
          costAtSale,
          totalAmount,
          profit,
          soldAt: new Date(),
        },
      });

      // 🔥 Ledger Entry
      await tx.inventoryLedger.create({
        data: {
          organizationId,
          storeId,
          productId,
          changeType: "SALE",
          quantityChange: -quantity,
          resultingQty: inventory.quantity,
          referenceId: createdSale.id,
          createdBy: userId,
        },
      });

      return createdSale;
    });

    res.status(201).json({
      message: "Sale recorded successfully",
      sale,
    });

  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      message: error.message || "Failed to record sale",
    });
  }
};