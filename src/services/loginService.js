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

// ----------------------------------
// LOGIN USER
// ----------------------------------

exports.loginUser = async (email) => {
  // Step 1: Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Step 2: If no user found, simply return null (login flow will check)
  if (!user) return null;

  // Step 3: Validate account is active
  await ensureUserEnabled(user.id);

  // Step 4: Return user for password validation
  return user;
};
