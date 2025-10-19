const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');

// Verify OTP from DB
exports.verifyOtp = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};
