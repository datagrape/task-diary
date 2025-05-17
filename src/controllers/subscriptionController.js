const bcrypt = require("bcrypt");
const subscriptionService = require('../services/subscriptionService');

exports.subscription = async (req, res, next) => {
    const {email, subscriptionType } = req.body;
    if (!email || !subscriptionType ) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const updatedUser = await subscriptionService.subscription(email, subscriptionType);
        return res.status(200).json({
            message: "Subscription updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating subscription:", error);
        next(error);
    }
};
