const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getSettings,
  updateSettings,
} = require("../controllers/notificationController");

const router = Router();

// All notification routes require authentication
router.use(verifyToken);

// Get all notifications for the current user
router.get("/", getNotifications);

// Mark a notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.post("/read-all", markAllAsRead);

// Get notification settings
router.get("/settings", getSettings);

// Update notification settings
router.put("/settings", updateSettings);

module.exports = router;
