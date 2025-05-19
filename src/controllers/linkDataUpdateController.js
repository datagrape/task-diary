const bcrypt = require("bcrypt");
const linkDataUpdateService = require('../services/linkDataUpdateService');

exports.linkData = async (req, res) => {
  const { link, owner, duedate, group, member, taskname, completeddate, location } = req.body;

  if (!link) {
    return res.status(400).json({ error: "Missing required field: link is required." });
  }

  try {
    const linkResponse = await linkDataUpdateService.linkData(
      link,
      owner,
      duedate,
      group,
      member,
      taskname,
      completeddate,
      location
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
  const { link, member } = req.query; // Query parameters from the request

  if (!link || !member) {
    return res.status(400).json({ error: "Missing required fields: link and member are required." });
  }

  try {
    const linkResponse = await linkDataUpdateService.linkData(
      link,
      member
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
  const { link, owner } = req.query; // Query parameters from the request

  if (!link || !owner) {
    return res.status(400).json({ error: "Missing required fields: link and owner are required." });
  }

  try {
    const linkResponse = await linkDataUpdateService.linkData(
      link,
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

