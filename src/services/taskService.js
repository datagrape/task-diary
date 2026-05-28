const { Prisma } = require('@prisma/client');
const prisma = require('../prismaClient');
const ALLOWED_TASK_STATUS = new Set(['created', 'assigned', 'completed']);

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
exports.createTask = async (payload) => {
    const {
        name,
        userId,
        groupName,
        groupId,
        activityName,
        activityId,
        member,
        dueDate,
        type,
        status,
        location,
        taskId,
        link,
        completeddate,
        updatedBy,
        url
    } = payload;

    const normalizeIntOrNull = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
        return Number.isInteger(parsed) ? parsed : null;
    };
    const normalizeLocation = (value) =>
        typeof value === 'object' && value !== null ? JSON.stringify(value) : value ?? null;
    const normalizeStatus = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        if (!normalized) return type === 'assigned' ? 'assigned' : 'created';
        if (!ALLOWED_TASK_STATUS.has(normalized)) {
            const err = new Error('status must be one of: created, assigned, completed');
            err.status = 400;
            throw err;
        }
        return normalized;
    };

    const normalizedUserId = normalizeIntOrNull(userId);
    const normalizedGroupId = normalizeIntOrNull(groupId);
    const normalizedActivityId = normalizeIntOrNull(activityId);
    const normalizedLocation = normalizeLocation(location);
    const normalizedStatus = normalizeStatus(status);

    if (normalizedUserId !== null) {
        await ensureUserEnabled(normalizedUserId);
    }

    return prisma.$transaction(async (tx) => {
        const task = await tx.task.upsert({
            where: { taskId: String(taskId) },
            update: {
                name,
                userId: normalizedUserId,
                groupName,
                groupId: normalizedGroupId,
                activityName,
                activityId: normalizedActivityId,
                member,
                dueDate,
                type,
                status: normalizedStatus,
                location: normalizedLocation,
                link: link || null,
                completeddate: completeddate || null,
                updatedBy: updatedBy || null,
                url: url || null
            },
            create: {
                taskId: String(taskId),
                name,
                userId: normalizedUserId,
                groupName,
                groupId: normalizedGroupId,
                activityName,
                activityId: normalizedActivityId,
                member,
                dueDate,
                type,
                status: normalizedStatus,
                location: normalizedLocation,
                link: link || null,
                completeddate: completeddate || null,
                updatedBy: updatedBy || null,
                url: url || null
            }
        });

        const linkValue = link ? String(link) : null;
        const taskIdValue = String(taskId);

        if (linkValue) {
            const existingLink = await tx.link.findUnique({ where: { link: linkValue } });
            const existingByTaskId = existingLink ? null : await tx.link.findFirst({ where: { taskId: taskIdValue } });

            if (existingLink || existingByTaskId) {
                await tx.link.update({
                    where: { id: (existingLink || existingByTaskId).id },
                    data: {
                        taskId: taskIdValue,
                        link: linkValue,
                        owner: normalizedUserId !== null ? String(normalizedUserId) : null,
                        duedate: dueDate,
                        group: groupName,
                        member,
                        taskname: name,
                        completeddate: completeddate || null,
                        location: normalizedLocation,
                        updatedBy: updatedBy || null,
                        status: normalizedStatus
                    }
                });
            } else {
                await tx.link.create({
                    data: {
                        taskId: taskIdValue,
                        link: linkValue,
                        owner: normalizedUserId !== null ? String(normalizedUserId) : null,
                        duedate: dueDate,
                        group: groupName,
                        member,
                        taskname: name,
                        completeddate: completeddate || null,
                        location: normalizedLocation,
                        updatedBy: updatedBy || null,
                        subscription: 'free',
                        status: normalizedStatus
                    }
                });
            }
        }

        return task;
    });
};

// ----------------------------------------------------
// GET TASKS BY USER
// ----------------------------------------------------
exports.getTaskByUser = async (userId) => {
    const uid = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (!Number.isInteger(uid)) return [];
    await ensureUserEnabled(uid);

    const tasks = await prisma.task.findMany({
        where: {
            userId: uid,
        },
    });

    return tasks;
};
