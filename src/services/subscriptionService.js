// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// exports.subscription = async ( email, subscriptionType) => {
//     // Find user by email
//   const user = await prisma.user.findUnique({
//       where: { email: email },
//   });

//   if (!user) {
//       return res.status(404).json({ message: "User not found" });
//   }

//   // Update subscription type in the user record
//   return prisma.user.update({
//       where: { email: email },
//       data: { subscriptionType: subscriptionType },
//   });

// };
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

exports.subscription = async (email, subscriptionType) => {
    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        err.body = { message: "User not found" };
        throw err;
    }

    // Ensure account is active
    await ensureUserEnabled(user.id);

    return prisma.user.update({
        where: { email: user.email },
        data: { subscriptionType },
    });
};

