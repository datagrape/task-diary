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

// ----------------------------------------------------
// CREATE TASK
// ----------------------------------------------------
exports.createTask = async (
    name,
    userId,
    groupName,
    groupId,
    activityName,
    activityId,
    member,
    dueDate,
    type,
    location
) => {

    await ensureUserEnabled(userId);

    return prisma.task.create({
        data: {
            name,
            userId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
            groupName,
            groupId,
            activityName,
            activityId,
            member,
            dueDate,
            type,
            location
        },
    });
};

// ----------------------------------------------------
// GET TASKS BY USER
// ----------------------------------------------------
exports.getTaskByUser = async (userId) => {

    await ensureUserEnabled(userId);

    const tasks = await prisma.task.findMany({
        where: {
            userId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
        },
    });

    return tasks;
};
