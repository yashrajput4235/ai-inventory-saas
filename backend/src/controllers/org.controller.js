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
      return res.status(400).json({
        message: "User already exists",
      });
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