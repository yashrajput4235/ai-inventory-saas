const prisma = require("../config/prisma");

exports.addStock = async (req, res) => {
  try {
    const { storeId, productId, quantity } = req.body;
    const { userId, role, organizationId } = req.user;

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

      if (existingInventory) {
        return await tx.inventory.update({
          where: {
            id: existingInventory.id,
          },
          data: {
            quantity: existingInventory.quantity + quantity,
          },
        });
      }

      return await tx.inventory.create({
        data: {
          storeId,
          productId,
          quantity,
        },
      });
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
    const { organizationId } = req.user;

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