import { Request, Response } from "express";
import User from "../models/User";
import { uploadToFirebase } from "../utils/firebase";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Update the current user's profile
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { name, bio, preferredContact, contactInfo } = req.body;

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.name = name.trim();

    // Update optional fields if provided
    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (preferredContact !== undefined) {
      user.preferredContact = preferredContact.trim();
    }

    if (contactInfo !== undefined) {
      user.contactInfo = contactInfo.trim();
    }

    // Handle profile image upload if provided
    if (req.file) {
      try {
        const fileUrl = await uploadToFirebase(req.file);
        user.profileImage = fileUrl;
      } catch (uploadError) {
        console.error("Profile image upload error:", uploadError);
        return res.status(500).json({
          message: "Error uploading profile image",
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown error",
        });
      }
    }

    // Save the user
    await user.save();

    // Return updated user info
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        preferredContact: user.preferredContact,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get public user information by ID
 * This endpoint returns only public information about a user
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find the user
    const user = await User.findById(id).select("-password -email -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return only public user info
    res.json({
      id: user._id,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      // We exclude private fields like email, contactInfo, etc.
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
