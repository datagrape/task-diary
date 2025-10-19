const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');

exports.createActivity = async (name, userId) => {
    return prisma.activity.create({
        data: { name, userId },
    });
};

exports.getActivityByUser = async (userId) => {
    const activities = await prisma.activity.findMany({
        where: {
            userId: userId,
        },
    });

    return activities;
};

exports.deleteActivityById = async (id) => {
    await prisma.activity.delete({
        where: { id: parseInt(id) },
    });
};