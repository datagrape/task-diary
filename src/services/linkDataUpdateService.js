const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.linkData = async (link, owner, companyName, activityName, employeeName, data) => {
  const existingLink = await prisma.link.findUnique({ where: { link } });

  if (existingLink) {
    let recievers = existingLink.recievers || {};
    const updatedData = { ...existingLink.data };

    if (!recievers[employeeName]) {
      recievers[employeeName] = { [companyName]: activityName };
    } else {
      if (!recievers[employeeName][companyName]) {
        recievers[employeeName][companyName] = activityName;
      } else {
        const existingActivities = recievers[employeeName][companyName];
        const mergedActivities = [
          ...existingActivities,
          ...activityName.filter(
            (newActivity) =>
              !existingActivities.some(
                (existingActivity) => existingActivity.value === newActivity.value
              )
          )
        ];
        recievers[employeeName][companyName] = mergedActivities;
      }
    }

    Object.keys(data).forEach((key) => {
      updatedData[key] = data[key];
    });

    return prisma.link.update({
      where: { link },
      data: { recievers, data: updatedData }
    });
  } else {
    const newRecievers = {
      [employeeName]: { [companyName]: activityName }
    };

    return prisma.link.create({
      data: {
        link,
        owner,
        recievers: newRecievers,
        data: data || {}
      }
    });
  }
};
