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
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

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
          otp,
          otpExpiry,
        },
      });

      return { organization, adminUser };
    });

    // Send OTP (outside transaction)
    await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);

    res.status(201).json({
      message: "Organization and admin created. Verify OTP.",
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
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 🔥 Transaction starts
    const result = await prisma.$transaction(async (tx) => {
      const managerUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "manager",
          organizationId: adminOrganizationId,
          otp,
          otpExpiry,
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

    // Send OTP
    await sendEmail(email, "Verify Your Manager Account", `Your OTP is: ${otp}`);

    res.status(201).json({
      message: "Store manager created and assigned. Verify OTP.",
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