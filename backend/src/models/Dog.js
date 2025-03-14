const mongoose = require("mongoose");
const { Schema } = mongoose;

const dogSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    breed: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    locationName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photos: [
      {
        type: String,
        required: false,
      },
    ],
    status: {
      type: String,
      enum: ["active", "resolved", "expired"],
      default: "active",
      required: true,
    },
    contact: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      required: false,
    },
    userContact: {
      type: String,
      required: false,
    },
    userContactInfo: {
      type: String,
      required: false,
    },
    lastSeen: {
      type: Date,
      required: false,
    },
    foundDate: {
      type: Date,
      required: false,
    },
    currentStatus: {
      type: String,
      enum: ["temporary", "shelter", "on_location"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for location-based queries
dogSchema.index({ location: "2dsphere" });

// Create a text index for search functionality
dogSchema.index({
  breed: "text",
  color: "text",
  description: "text",
  locationName: "text",
});

const Dog = mongoose.model("Dog", dogSchema);

module.exports = Dog;
