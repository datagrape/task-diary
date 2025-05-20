const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.linkData = async (id, link, owner, duedate, group, member, taskname, completeddate, location) => {
  const existingLink = await prisma.link.findUnique({ where: { link } });

  if (existingLink) {
    // Update the existing link with new data
    return prisma.link.update({
      where: { id },
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
        taskname,
        completeddate, 
        location
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


exports.getMemberLinkData = async (link, member) => {
  const existingLink = await prisma.link.findFirst({ where: { link, member } });
  // If `link` and `member` are provided, fetch the specific link
  if (existingLink) {
    return prisma.link.findFirst({
      where: { link, member }
    });
  }
};

exports.getOwnerLinkData = async (link, owner) => {
  const existingLink = await prisma.link.findFirst({ where: { link, owner } });
  // If `link` and `owner` are provided, fetch the specific link
  if (existingLink) {
    return prisma.link.findFirst({
      where: { link, owner }
    });
  }
};



