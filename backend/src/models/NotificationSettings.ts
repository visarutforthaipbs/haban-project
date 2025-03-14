import mongoose, { Document, Schema } from "mongoose";

export interface INotificationSettings extends Document {
  userId: mongoose.Types.ObjectId;
  enableEmailNotifications: boolean;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<INotificationSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    enableEmailNotifications: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !this.enableEmailNotifications || (v && v.length > 0);
        },
        message: "Email is required when email notifications are enabled",
      },
    },
  },
  {
    timestamps: true,
  }
);

const NotificationSettings = mongoose.model<INotificationSettings>(
  "NotificationSettings",
  notificationSettingsSchema
);

export default NotificationSettings;
