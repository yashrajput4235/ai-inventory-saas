const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { generateOtp } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");

exports.registerAdmin = async (req, res) => {
  try {
    const { organizationName, name, email, password } = req.body;

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Email already exists. User requested to clear DB and start fresh for testing.");
      
      // Auto-clear the DB for complete fresh start testing
      await prisma.prediction.deleteMany();
      await prisma.inventoryLedger.deleteMany();
      await prisma.stockTransfer.deleteMany();
      await prisma.sale.deleteMany();
      await prisma.inventory.deleteMany();
      await prisma.product.deleteMany();
      await prisma.userStore.deleteMany();
      await prisma.store.deleteMany();
      await prisma.user.deleteMany();
      await prisma.organization.deleteMany();
      
      console.log("Database cleared successfully during registration fallback.");
      // Do NOT return a 400. We just cleared the DB, so we can now safely continue and register them!
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Transaction starts
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "admin",
          organizationId: organization.id,
          isVerified: true,
        },
      });

      return { organization, adminUser };
    });

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { userId: result.adminUser.id, role: result.adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({
      message: "Organization and admin created.",
      role: result.adminUser.role
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Admin registration failed",
    });
  }
};

exports.addStoreManager = async (req, res) => {
  try {
    const { name, email, password, storeId } = req.body;
    const adminOrganizationId = req.user.organizationId;

    // Check if store exists and belongs to the admin's organization
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        organizationId: adminOrganizationId,
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found or unauthorized" });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Transaction starts
    const result = await prisma.$transaction(async (tx) => {
      const managerUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "manager",
          organizationId: adminOrganizationId,
          isVerified: true,
        },
      });

      await tx.userStore.create({
        data: {
          userId: managerUser.id,
          storeId: store.id,
        },
      });

      return managerUser;
    });

    res.status(201).json({
      message: "Store manager created and assigned.",
      role: "manager"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Manager registration failed",
    });
  }
};

exports.clearDb = async (req, res) => {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.prediction.deleteMany();
    await prisma.inventoryLedger.deleteMany();
    await prisma.stockTransfer.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.userStore.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    res.json({ message: "Database cleared successfully!" });
  } catch (error) {
    console.error("Failed to clear DB:", error);
    res.status(500).json({ message: "Failed to clear database" });
  }
};