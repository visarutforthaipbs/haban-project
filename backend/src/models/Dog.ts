import mongoose, { Document, Schema } from "mongoose";

export interface IDog extends Document {
  type: "lost" | "found";
  name?: string;
  breed: string;
  color: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  locationName: string;
  description: string;
  photos: string[];
  status: "active" | "resolved" | "expired";
  contact: string;
  userId?: string;
  userContact?: string;
  userContactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSeen?: Date;
  foundDate?: Date;
  currentStatus?: "temporary" | "shelter" | "on_location";
}

const dogSchema = new Schema<IDog>(
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

export const Dog = mongoose.model<IDog>("Dog", dogSchema);

export default Dog;
