import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  facebookId?: string;
  firebaseUid?: string;
  profileImage?: string;
  bio?: string;
  preferredContact?: string;
  contactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    preferredContact: {
      type: String,
      trim: true,
    },
    contactInfo: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ facebookId: 1 }, { unique: true, sparse: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
