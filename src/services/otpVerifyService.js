const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');

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
// VERIFY OTP
// -------------------------------------------

exports.verifyOtp = async (email) => {
    const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
        const err = new Error('User with that email not found');
        err.status = 404;
        err.body = { message: 'User with that email not found' };
        throw err;
    }

    // Ensure user is active before verifying OTP
    await ensureUserEnabled(user.id);

    // Return full user for OTP + expiration check
    return prisma.user.findUnique({
        where: { id: user.id }
    });
};
