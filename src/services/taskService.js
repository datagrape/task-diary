const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTask = async (
    name, 
    userId,        // Reference to User
    groupName,
    groupId,
    activityName,
    activityId,
    member,
    dueDate,
    type) => {
    return prisma.task.create({
        data: {name, userId, groupName, groupId, activityName, activityId, member, dueDate, type },
    });
};

exports.getTaskByUser = async (userId) => {
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
        },
    });

    return tasks;
};