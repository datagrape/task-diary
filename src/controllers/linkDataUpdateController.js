const bcrypt = require("bcrypt");
const linkDataUpdateService = require('../services/linkDataUpdateService');

exports.linkData = async (req, res) => {
  const { link, owner, companyName, activityName, employeeName, data } = req.body;

  if (!link) {
    return res.status(400).json({ error: "Missing required field: link is required." });
  }

  try {
    const linkResponse = await linkDataUpdateService.linkData(
      link,
      owner,
      companyName,
      activityName,
      employeeName,
      data
    );

    return res.status(existingLink ? 200 : 201).json({
      message: existingLink ? "Link updated successfully" : "Link created successfully",
      link: linkResponse
    });
  } catch (error) {
    console.error("Error handling link:", error);
    return res.status(500).json({
      error: "An error occurred while creating/updating the link."
    });
  }
};
