const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');
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

const ensureUserEnabled = async (userId) => {
    const uid = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { id: true, isDisabled: true }
    });

    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        err.body = { message: 'User not found' };
        throw err;
    }

    if (user.isDisabled) {
        const err = new Error('User is deactivated');
        err.status = 401;
        err.body = { message: 'User is deactivated' };
        throw err;
    }

    return user;
};

// -------------------------------------------
// SEND OTP
// -------------------------------------------

exports.sendOtp = async (email) => {
    const otp = generateOtp();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    // Find user (case-insensitive email)
    const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
        const err = new Error('User with that email not found');
        err.status = 404;
        err.body = { message: 'User with that email not found' };
        throw err;
    }

    // Ensure user is active
    await ensureUserEnabled(user.id);

    // Update OTP
    await prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpiration },
    });

    // Send Email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
};
