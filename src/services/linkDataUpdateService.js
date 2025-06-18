const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fetch = require("node-fetch");

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString().slice(0, length);
}

exports.linkData = async (
  taskId,
  link,
  owner,
  duedate,
  group,
  member,
  taskname,
  completeddate,
  location,
  subscription,
  updatedBy
) => {
  const existingLink = await prisma.link.findUnique({ where: { link } });

  // Check if all links with the same taskId have updatedBy as null
  const linksWithTaskId = await prisma.link.findMany({
    where: { taskId }
  });

  const allUpdatedByNull = linksWithTaskId.length > 0 && linksWithTaskId.every(link => link.updatedBy === null);

  if (!existingLink) {
    return prisma.link.create({
      data: {
        taskId,
        link,
        owner,
        duedate,
        group,
        member,
        taskname,
        completeddate,
        location,
        subscription
      }
    });
  }
  else if (existingLink && allUpdatedByNull) {

    // ✅ Else update the link with new values
    const updatedLinks = await prisma.link.updateMany({
      where: { taskId },
      data: {
      completeddate,
      location,
      updatedBy,
      isAccessed: 1 // Mark as accessed
      }
    });

    // Return all links for that taskId after update
    const allLinks = await prisma.link.find({
      where: { link }
    });

    return allLinks;
  }
  else {
      // Find the first link with the same taskId where updatedBy is not null
      const updatedLink = linksWithTaskId.find(link => link.updatedBy !== null);
      // if (updatedLink) {
      return {
          completeddate: updatedLink.completeddate,
          location: updatedLink.location,
          updatedBy: updatedLink.updatedBy,
          message: "Link is already updatedBy by someone"
        };
      // } else {
      //   return {
      //   message: "No updated link found"
      //   };
      // }
  }
    // if( updateType === "task") {
    //     // ✅ If both values already exist, just return them
    //     if (existingLink.completeddate && existingLink.location) {
    //       return {
    //         completeddate: existingLink.completeddate,
    //         location: existingLink.location,
    //         updatedBy: existingLink.updatedBy
    //       };
    //     }

    //     // ✅ Else update the link with new values
    //     return prisma.link.update({
    //       where: { link },
    //       data: {
    //         completeddate,
    //         location,
    //         updatedBy
    //       }
    //     });
    //   }
    //   else if (updateType === "member") {
    //     // If the link exists and updateType is 'update', update the existing link
    //     return prisma.link.update({
    //       where: { link },
    //       data: {
    //         member
    //       }
    //     });
    //   }
  // }

  // If subscription is 'paid', send OTPs and update paidmemberdata
  // if (subscription == "paid") {
  //   try {
  //     const memberObj = typeof member == "string" ? JSON.parse(member) : member;

  //     for (const name in memberObj) {
  //       const phoneNumber = memberObj[name];
  //       const otp = generateOTP();

  //       // Send OTP via Textbelt
  //       // await sendFreeOtpTextbelt(phoneNumber, otp);

  //       // Save link and OTP to paidmemberdata table
  //       await prisma.paidmemberdata.create({
  //         data: {
  //           link,
  //           otp
  //         }
  //       });
  //       return prisma.link.create({
  //         data: {
  //           link,
  //           owner,
  //           duedate,
  //           group,
  //           member,
  //           taskname,
  //           completeddate,
  //           location,
  //           subscription
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error processing paid members:", error);
  //   }
  // } else {
  //   return prisma.link.create({
  //     data: {
  //       link,
  //       owner,
  //       duedate,
  //       group,
  //       member,
  //       taskname,
  //       completeddate,
  //       location,
  //       subscription
  //     }
  //   });
  // }
};

// Send OTP using Textbelt (free test version)
// async function sendFreeOtpTextbelt(phoneNumber, otp) {
//   try {
//     const response = await fetch("https://textbelt.com/text", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         phone: phoneNumber,
//         message: `Your OTP is ${otp}`,
//         key: "textbelt" // free test key
//       })
//     });

//     const result = await response.json();
//     console.log(`OTP sent to ${phoneNumber}:`, result);
//   } catch (error) {
//     console.error(`Failed to send OTP to ${phoneNumber}:`, error);
//   }
// }

exports.getLinkData = async (links) => {
  // Ensure it's an array
  if (!Array.isArray(links)) {
    throw new Error("Expected an array of links");
  }

  return prisma.link.findMany({
    where: {
      link: {
        in: links
      }
    }
  });
};

exports.checkLinkAccessed = async (link) => {
  // Find the link by its value
  const existingLink = await prisma.link.findUnique({
    where: { link }
  });

  if (!existingLink || existingLink.isAccessed == 1) {
    return { message: "Link is expired or not found" };
  }
 else if (existingLink.isAccessed == 0) {
    // Mark as accessed and return updated data
    const updatedLink = await prisma.link.update({
      where: { link },
      data: { isAccessed: 1 }
    });
    return updatedLink;
  }
};

exports.getMemberLinkData = async (link, otp = null) => {
  // Accept link as string or array
  const linksArray = Array.isArray(link) ? link : [link];

  const existingLinks = await prisma.link.findMany({
    where: {
      link: {
        in: linksArray
      }
    }
  });

  if (!existingLinks || existingLinks.length === 0) {
    return { message: "Link(s) not found" };
  }

  return existingLinks;
};
  // FREE subscription logic
  // if (existingLink.subscription == "free") {
  //   if (existingLink.freecount > 0) {
  //     await prisma.link.update({
  //       where: { id: existingLink.id },
  //       data: { freecount: { decrement: 1 } }
  //     });

  //     return existingLink;
  //   } else {
  //     return { message: "Data not available" };
  //   }
  // }
  // // PAID subscription logic
  // if (existingLink.subscription == "paid") {
  //   if (!otp) {
  //     return { message: "OTP required for paid access" };
  //   }

  //   const paidMember = await prisma.paidmemberdata.findFirst({
  //     where: {
  //       link: link,
  //       otp: otp
  //     }
  //   });

  //   if (!paidMember) {
  //     return { message: "Invalid OTP or link" };
  //   }

  //   if (paidMember.otpcount > 0) {
  //     await prisma.paidmemberdata.update({
  //       where: { id: paidMember.id },
  //       data: { otpcount: { decrement: 1 } }
  //     });

  //     return existingLink;
  //   } else {
  //     return { message: "Data not available" };
  //   }
  // }
  // return { message: "Invalid subscription type" };
// };

exports.getOwnerLinkData = async ( owner) => {
  const existingLink = await prisma.link.findFirst({ where: {  owner } });
  // If `link` and `owner` are provided, fetch the specific link
  if (existingLink) {
    return prisma.link.findMany({
      where: { owner }
    });
  }
};