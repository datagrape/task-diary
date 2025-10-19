const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');

exports.loginUser = async (email) => {
  // Find user by username
  return prisma.user.findUnique({
    where: { email },
  });
};
