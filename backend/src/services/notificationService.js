const Notification = require("../models/Notification");
const NotificationSettings = require("../models/NotificationSettings");
const { sendEmail } = require("./emailService");

/**
 * Create a new notification
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      read: false,
    });

    // Check if user has email notifications enabled
    const settings = await NotificationSettings.findOne({ userId });
    if (settings?.enableEmailNotifications && settings.email) {
      await sendEmailNotification(settings.email, title, message, type);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (email, title, message, type) => {
  try {
    // For now, we'll just log the email that would be sent
    // In a real implementation, you would use an email service like SendGrid or Nodemailer
    console.log(`Sending email to ${email}`);
    console.log(`Subject: ${title}`);
    console.log(`Message: ${message}`);
    console.log(`Type: ${type}`);

    // Uncomment to actually send emails when email service is configured
    // await sendEmail({
    //   to: email,
    //   subject: title,
    //   text: message,
    // });
  } catch (error) {
    console.error("Error sending email notification:", error);
    // Don't throw the error - we don't want to fail the notification creation if email fails
  }
};

/**
 * Create a notification for a potential match
 */
const createMatchNotification = async (
  userId,
  dogId,
  matchDogId,
  matchPercentage
) => {
  const title = "Potential Match Found";
  const message = `We found a potential match for your dog with a ${matchPercentage}% match rate.`;
  const data = {
    dogId,
    matchDogId,
    matchPercentage,
  };

  return createNotification(userId, "match", title, message, data);
};

/**
 * Create a notification for a status update
 */
const createStatusUpdateNotification = async (userId, dogId, status, io) => {
  const statusText =
    status === "resolved"
      ? "reunited with their owner"
      : status === "expired"
      ? "listing expired"
      : "status updated";

  const title = "Status Update";
  const message = `The status of your dog listing has been updated to: ${statusText}`;
  const data = {
    dogId,
    status,
  };

  const notification = await createNotification(
    userId,
    "status_update",
    title,
    message,
    data
  );

  // Emit a socket event if we have socket.io instance
  if (io) {
    io.to(userId).emit("notification", notification);
  }

  return notification;
};

/**
 * Create a notification for a new comment
 */
const createCommentNotification = async (
  userId,
  dogId,
  commentId,
  commenterName
) => {
  const title = "New Comment";
  const message = `${commenterName} commented on your dog listing.`;
  const data = {
    dogId,
    commentId,
  };

  return createNotification(userId, "comment", title, message, data);
};

module.exports = {
  createNotification,
  createMatchNotification,
  createStatusUpdateNotification,
  createCommentNotification,
};
