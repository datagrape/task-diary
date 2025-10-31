const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP and Save to DB
exports.sendOtp = async (email) => {
  try {
    const otp = generateOtp();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    console.log("Generated OTP:", otp);
    console.log("Expiration:", otpExpiration);
    console.log("Email:", email);

    // ✅ Use upsert to create or update user record
    await prisma.user.upsert({
      where: { email },
      update: { otp, otpExpiration },
      create: { email, otp, otpExpiration },
    });

    // ✉️ Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);

    return { success: true, message: 'OTP sent successfully' };

  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    throw new Error(err.message || "Failed to send OTP");
  }
};
