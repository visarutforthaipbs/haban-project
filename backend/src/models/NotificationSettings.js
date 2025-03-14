const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSettingsSchema = new Schema(
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
        validator: function (v) {
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

const NotificationSettings = mongoose.model(
  "NotificationSettings",
  notificationSettingsSchema
);

module.exports = NotificationSettings;
