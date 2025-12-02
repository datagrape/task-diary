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

// -----------------------------
// GROUP SERVICES
// -----------------------------

exports.createGroup = async (name, userId) => {
    await ensureUserEnabled(userId);

    return prisma.group.create({
        data: { 
            name, 
            userId: typeof userId === 'string' ? parseInt(userId, 10) : userId 
        },
    });
};

exports.getGroupByUser = async (userId) => {
    await ensureUserEnabled(userId);

    const groups = await prisma.group.findMany({
        where: {
            userId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
        },
    });

    return groups;
};

exports.deleteGroupById = async (id) => {
    const groupId = parseInt(id, 10);

    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        const err = new Error('Group not found');
        err.status = 404;
        err.body = { message: 'Group not found' };
        throw err;
    }

    // Validate parent user before deleting group
    await ensureUserEnabled(group.userId);

    await prisma.group.delete({
        where: { id: groupId },
    });
};
