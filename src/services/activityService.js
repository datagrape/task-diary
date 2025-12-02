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

exports.createActivity = async (name, userId) => {
    await ensureUserEnabled(userId);
    return prisma.activity.create({
        data: { name, userId: typeof userId === 'string' ? parseInt(userId, 10) : userId },
    });
};

exports.getActivityByUser = async (userId) => {
    await ensureUserEnabled(userId);
    const activities = await prisma.activity.findMany({
        where: {
            userId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
        },
    });

    return activities;
};

exports.deleteActivityById = async (id) => {
    const activityId = parseInt(id, 10);
    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
    });
    if (!activity) {
        const err = new Error('Activity not found');
        err.status = 404;
        err.body = { message: 'Activity not found' };
        throw err;
    }

    await ensureUserEnabled(activity.userId);

    await prisma.activity.delete({
        where: { id: activityId },
    });
};