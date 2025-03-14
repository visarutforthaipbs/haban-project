const User = require("../models/User");
const { uploadToFirebase } = require("../utils/firebase");

/**
 * Update the current user's profile
 */
const updateProfile = async (req, res) => {
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

module.exports = {
  updateProfile,
};
