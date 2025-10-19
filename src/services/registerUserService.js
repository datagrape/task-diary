// src/services/registerUserService.js
const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');

exports.createUser = async (email, hashedPassword, userType, subscriptionType) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    return await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        userType,
        subscriptionType
      },
      select: { id: true, email: true, userType: true, subscriptionType: true, createdAt: true }
    });
  } catch (err) {
    // Race-safe: map Prisma P2002 to a 409
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const e = new Error('An account with this email already exists.');
      e.status = 409; // Conflict
      throw e;
    }
    throw err;
  }
};
