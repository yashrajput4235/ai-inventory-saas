const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mail");
const crypto = require("crypto");
const { generateOtp } = require("../utils/generateOtp");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent to email" });

  } catch (error) {
  console.error("FULL ERROR:", error);
  res.status(500).json({
    message: error.message,
  });
}
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      return res.status(403).json({
        message: "Too many wrong attempts. Try again later."
      });
    }

    if (!user.otp || user.otp !== otp) {
      const attempts = user.otpAttempts + 1;

      if (attempts >= 3) {
        await prisma.user.update({
          where: { email },
          data: {
            otpAttempts: 0,
            otpBlockedUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 min block
          },
        });

        return res.status(403).json({
          message: "Too many wrong attempts. Account blocked for 10 minutes."
        });
      }

      await prisma.user.update({
        where: { email },
        data: {
          otpAttempts: attempts,
        },
      });

      return res.status(400).json({
        message: `Invalid OTP. ${3 - attempts} attempts left.`
      });
    }

    // OTP correct
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
        otpAttempts: 0,
        otpBlockedUntil: null,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

res.json({
  message: "Account verified successfully",
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};
     

// now making resend otp
exports.resendOtp = async(req,res)=>{
    try{
        const {email}=req.body;
        const user=await prisma.user.findUnique({
            where:{email},
        });
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(user.isVerified){
            return res.status(400).json({message:"User already verified"})
        }
        const otp=generateOtp();
        await prisma.user.update({
            where:{email},
            data:{
                otp,
                otpExpiry:new Date(Date.now()+10*60*1000),
            },
        });
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:"Your OTP Code",
            text:`Your OTP is ${otp}`,
        });
        res.json({message:"OTP sent to email"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Failed to resend OTP",error:error.message});
    }
}

// now login controller
exports.loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await prisma.user.findUnique({
            where:{email},
        });
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});

        }
        if(!user.isVerified){
            return res.status(403).json({
                message:"Please verify your email first",
            });
        }
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid credentials",
            });
        }
        const token=jwt.sign(
            {userId:user.id,role: user.role},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 24 * 60 * 60 * 1000, //// 1 day
        })
        res.json({message:"Login successful"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Failed to login",error:error.message});
    }
}
// forget pasword 
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",")[0] : "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click this link to reset your password: ${resetLink}`,
    });

    res.json({
      message: "Password reset link sent to email",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error sending reset link",
    });
  }
};
// Add Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Reset failed",
    });
  }
};
// adding logout controller
exports.logoutUser=(req,res)=>{
    res.clearCookie("token");
    res.json({message:"Logout successful"});
};