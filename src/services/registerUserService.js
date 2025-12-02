// src/services/registerUserService.js
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

exports.createUser = async (email, hashedPassword, userType, subscriptionType) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    // Check if a user already exists with this email (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      select: { id: true, isDisabled: true }
    });

    if (existingUser) {
      // If the user exists → validate account status
      await ensureUserEnabled(existingUser.id);

      // If user is enabled, treat it as duplicate registration
      const err = new Error('An account with this email already exists.');
      err.status = 409;
      throw err;
    }

    // No existing user → proceed with creation
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
    // Prisma unique constraint fallback (race-safe)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const e = new Error('An account with this email already exists.');
      e.status = 409;
      throw e;
    }

    throw err;
  }
};
