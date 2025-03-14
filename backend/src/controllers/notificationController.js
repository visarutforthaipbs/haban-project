const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const NotificationSettings = require("../models/NotificationSettings");

/**
 * Get all notifications for the current user
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user?.id,
    }).sort({ createdAt: -1 });

    return res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if the notification belongs to the requesting user
    if (notification.userId.toString() !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this notification" });
    }

    // Mark as read
    notification.read = true;
    await notification.save();

    return res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res
      .status(500)
      .json({ message: "Error marking notification as read" });
  }
};

/**
 * Mark all notifications as read for the current user
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user?.id, read: false },
      { $set: { read: true } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res
      .status(500)
      .json({ message: "Error marking all notifications as read" });
  }
};

/**
 * Get user's notification settings
 */
const getSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user?.id });

    if (!settings) {
      // Return default settings if none exist
      return res.json({
        enableEmailNotifications: false,
        email: req.user?.email,
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return res
      .status(500)
      .json({ message: "Error fetching notification settings" });
  }
};

/**
 * Update user's notification settings
 */
const updateSettings = async (req, res) => {
  try {
    const { enableEmailNotifications, email } = req.body;

    // Validate email if notifications are enabled
    if (enableEmailNotifications) {
      if (!email || email.trim() === "") {
        return res.status(400).json({
          message: "Email is required when email notifications are enabled",
        });
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Email format is invalid",
        });
      }
    }

    let settings = await NotificationSettings.findOne({ userId: req.user?.id });

    if (settings) {
      // Update existing settings
      settings.enableEmailNotifications = enableEmailNotifications;
      if (enableEmailNotifications) {
        settings.email = email.trim();
      } else {
        // Keep the email in the database but don't use it for notifications
        settings.email = settings.email || email || req.user?.email;
      }
      await settings.save();
    } else {
      // Create new settings
      settings = await NotificationSettings.create({
        userId: req.user?.id,
        enableEmailNotifications,
        email: email?.trim() || req.user?.email,
      });
    }

    return res.json({
      success: true,
      settings: {
        enableEmailNotifications: settings.enableEmailNotifications,
        email: settings.email,
      },
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error updating notification settings",
        error: error.message,
      });
    }
    return res.status(500).json({
      message: "Error updating notification settings",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getSettings,
  updateSettings,
};
