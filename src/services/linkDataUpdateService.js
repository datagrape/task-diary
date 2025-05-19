const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.linkData = async (link, owner, duedate, group, member, taskname, completeddate, location) => {
  const existingLink = await prisma.link.findUnique({ where: { link } });

  if (existingLink) {
    // Update the existing link with new data
    return prisma.link.update({
      where: { link },
      data: {
        completeddate,
        location
      }
    });
  } else {
    // Create a new link with the provided data
    return prisma.link.create({
      data: {
        link,
        owner,
        duedate,
        group,
        member,
        taskname
      }
    });
  }
};

exports.getLinkData = async (link) => {
  const existingLink = await prisma.link.findUnique({ where: { link } });
  // If `link` is provided, fetch the specific link
  if (existingLink) {
    return prisma.link.findUnique({
      where: { link: link }
    });
  }
};



