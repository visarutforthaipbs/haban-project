import Notification from "../models/Notification";
import NotificationSettings from "../models/NotificationSettings";
import { INotification } from "../models/Notification";
import { sendEmail } from "./emailService";

/**
 * Create a new notification
 */
export const createNotification = async (
  userId: string,
  type: "match" | "status_update" | "comment",
  title: string,
  message: string,
  data: Record<string, any> = {}
): Promise<INotification> => {
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
const sendEmailNotification = async (
  email: string,
  title: string,
  message: string,
  type: string
): Promise<void> => {
  try {
    // For now, we'll just log the email that would be sent
    // In a real implementation, you would use an email service like SendGrid or Nodemailer
    console.log(
      `[EMAIL NOTIFICATION] To: ${email}, Subject: ${title}, Type: ${type}`
    );
    console.log(`Message: ${message}`);

    // Uncomment when email service is implemented
    // await sendEmail({
    //   to: email,
    //   subject: title,
    //   text: message,
    //   html: `<h1>${title}</h1><p>${message}</p>`,
    // });
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
};

/**
 * Create a match notification
 */
export const createMatchNotification = async (
  userId: string,
  dogId: string,
  matchDogId: string,
  matchPercentage: number
): Promise<INotification> => {
  const title = "พบสุนัขที่อาจตรงกับที่คุณกำลังหา";
  const message = `พบสุนัขที่มีความคล้ายคลึง ${matchPercentage}% กับสุนัขของคุณ`;

  return createNotification(userId, "match", title, message, {
    dogId,
    matchDogId,
    matchPercentage,
  });
};

/**
 * Create a status update notification
 */
export const createStatusUpdateNotification = async (
  userId: string,
  dogId: string,
  status: string
): Promise<INotification> => {
  const statusText = status === "resolved" ? "พบเจอแล้ว" : "กำลังตามหา";
  const title = "สถานะการค้นหาถูกอัพเดท";
  const message = `รายงานสุนัขของคุณถูกอัพเดทเป็น "${statusText}"`;

  return createNotification(userId, "status_update", title, message, {
    dogId,
    status,
  });
};

/**
 * Create a comment notification
 */
export const createCommentNotification = async (
  userId: string,
  dogId: string,
  commentId: string,
  commenterName: string
): Promise<INotification> => {
  const title = "มีความคิดเห็นใหม่";
  const message = `${commenterName} ได้แสดงความคิดเห็นในประกาศของคุณ`;

  return createNotification(userId, "comment", title, message, {
    dogId,
    commentId,
  });
};
