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
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.subscription = async (email, subscriptionType) => {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    // Throw an error instead of using res
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: { email },
    data: { subscriptionType },
  });
};
