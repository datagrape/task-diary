const bcrypt = require("bcrypt");
const linkDataUpdateService = require('../services/linkDataUpdateService');

// exports.linkData = async (req, res) => {
//   const { link, owner, duedate, group, member, taskname, completeddate, location } = req.body;

//   if (!link) {
//     return res.status(400).json({ error: "Missing required field: link is required." });
//   }

//   try {
//     const linkResponse = await linkDataUpdateService.linkData(
//       link,
//       owner,
//       duedate,
//       group,
//       member,
//       taskname,
//       completeddate,
//       location
//     );

//     return res.status(existingLink ? 200 : 201).json({
//       message: existingLink ? "Link updated successfully" : "Link created successfully",
//       link: linkResponse
//     });
//   } catch (error) {
//     console.error("Error handling link:", error);
//     return res.status(500).json({
//       error: "An error occurred while creating/updating the link."
//     });
//   }
// };

function cleanString(value) {
  return typeof value === 'string' ? value.replace(/\x00/g, '') : value;
}

exports.linkData = async (req, res) => {
  let {
    link, owner, duedate, group, member, taskname, completeddate, location
  } = req.body;

  if (!link) {
    return res.status(400).json({ error: "Missing required field: link is required." });
  }

  // 🧼 Sanitize all string inputs
  link = cleanString(link);
  owner = cleanString(owner);
  group = cleanString(group);
  member = cleanString(member);
  taskname = cleanString(taskname);
  completeddate = cleanString(completeddate);
  location = cleanString(location);

  
  // 🔍 Check for null bytes (for debugging)
  for (const [key, value] of Object.entries({ link, owner, duedate, group, member, taskname, completeddate, location })) {
    if (typeof value === 'string' && value.includes('\x00')) {
      console.log(`🚨 Null byte found in field: ${key}`);
    }
  }

  try {
    const linkResponse = await linkDataUpdateService.linkData(
      link, owner, duedate, group, member, taskname, completeddate, location
    );

    return res.status(201).json({
      message: "Link created/updated successfully",
      link: linkResponse
    });
  } catch (error) {
    console.error("Error handling link:", error);
    return res.status(500).json({
      error: "An error occurred while creating/updating the link."
    });
  }
};


exports.getLinkData = async (req, res) => {
  const { link } = req.query; // Query parameters from the request

  if (!link) {
    return res.status(400).json({ error: "Missing required field: link is required." });
  }

  try {
    const linkResponse = await linkDataUpdateService.linkData(
      link
    );

    return res.status(200).json({
      message: "Link data retrieved successfully",
      link: linkResponse
    });
  } catch (error) {
    console.error("Error handling link:", error);
    return res.status(500).json({
      error: "An error occurred while creating/updating the link."
    });
  }
};
exports.getMemberLinkData = async (req, res) => {
  let {link } = req.query; // Query parameters from the request

  if (!link) {
    return res.status(400).json({ error: "Missing required fields: link is required." });
  }
  // 🧼 Sanitize all string inputs
  link = cleanString(link);
  try {
    
    const linkResponse = await linkDataUpdateService.getMemberLinkData(
      link
    );

    return res.status(200).json({
      message: "Link data retrieved successfully",
      link: linkResponse
    });
  } catch (error) {
    console.error("Error handling link:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving the link data."
    });
  }
};

exports.getOwnerLinkData = async (req, res) => {
  let {owner } = req.query; // Query parameters from the request

  if (!owner) {
    return res.status(400).json({ error: "Missing required fields: owner is required." });
  }

  // 🧼 Sanitize all string inputs
  owner = cleanString(owner);
  try {
    const linkResponse = await linkDataUpdateService.getOwnerLinkData(
      owner
    );

    return res.status(200).json({
      message: "Link data retrieved successfully",
      link: linkResponse
    });
  } catch (error) {
    console.error("Error handling link:", error);
    return res.status(500).json({
      error: "An error occurred while retrieving the link data."
    });
  }
};

