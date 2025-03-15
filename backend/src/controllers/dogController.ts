import { Request, Response } from "express";
import { dogService } from "../services/dogService";
import { getFileUrl } from "../utils/fileUtils";
import { uploadToFirebase } from "../utils/firebase";
import { createStatusUpdateNotification } from "../services/notificationService";
import { findPotentialMatches } from "../services/matchingService";
import mongoose from "mongoose";
import Dog from "../models/Dog";
import User from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    displayName: string;
    pictureUrl?: string;
    email?: string;
  };
}

export const createDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dogData = { ...req.body };

    // Parse location if it's a string
    if (typeof dogData.location === "string") {
      try {
        dogData.location = JSON.parse(dogData.location);
      } catch (error) {
        console.error("Location parsing error:", error);
        return res.status(400).json({ message: "Invalid location format" });
      }
    }

    // Upload photos to Firebase Storage if available and Firebase is configured
    if (req.files && Array.isArray(req.files)) {
      try {
        console.log("Uploading files to Firebase...");
        const uploadPromises = (req.files as Express.Multer.File[]).map(
          async (file) => {
            try {
              return await uploadToFirebase(file);
            } catch (error) {
              console.error(
                `Error uploading file ${file.originalname}:`,
                error
              );
              throw error;
            }
          }
        );
        dogData.photos = await Promise.all(uploadPromises);
        console.log("Files uploaded successfully:", dogData.photos);
      } catch (error) {
        console.error("Error uploading files to Firebase:", error);
        return res.status(500).json({
          message: "Error uploading files. Please try again.",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Add user information if available
    if (req.user) {
      dogData.userId = req.user.id;
      dogData.userContact = req.user.email;

      // Get user's contactInfo if available
      try {
        const User = require("../models/User").default;
        const userRecord = await User.findById(req.user.id);
        if (userRecord && userRecord.contactInfo) {
          dogData.userContactInfo = userRecord.contactInfo;
        }
      } catch (error) {
        console.error("Error fetching user contactInfo:", error);
        // Continue even if we can't get contactInfo
      }
    }

    console.log("Creating dog report with data:", dogData);
    const dog = await dogService.createDog(dogData);
    console.log("Dog report created successfully:", dog);

    // Trigger matching service to find potential matches
    if (dog && dog._id) {
      try {
        // Run matching in the background
        setTimeout(() => {
          findPotentialMatches(
            dog._id ? dog._id.toString() : dog.id.toString()
          ).catch((err) => console.error("Error in background matching:", err));
        }, 0);
      } catch (matchingError) {
        console.error("Error triggering matching service:", matchingError);
        // Continue even if matching fails
      }
    }

    res.status(201).json(dog);
  } catch (error) {
    console.error("Error creating dog report:", error);
    res.status(500).json({
      message: "Error creating dog report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDogs = async (req: Request, res: Response) => {
  try {
    const {
      type,
      status = "active",
      lat,
      lng,
      radius = 10000, // Default radius in meters (10km)
      userId,
    } = req.query;

    const params: any = { status };
    if (type) params.type = type;
    if (userId) params.userId = userId;

    // If coordinates are provided, find dogs within radius
    if (lat && lng) {
      params.coordinates = {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radius: radius ? parseInt(radius as string) : 10000,
      };
    }

    const dogs = await dogService.getDogs(params);
    res.json(dogs);
  } catch (error) {
    console.error("Error fetching dogs:", error);
    res.status(500).json({ message: "Error fetching dogs" });
  }
};

export const getDog = async (req: Request, res: Response) => {
  try {
    const dog = await dogService.getDogById(req.params.id);
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if HTML format is requested (for social media)
    if (req.query.format === "html") {
      console.log(`Returning HTML format for dog ${dog._id} for social media`);

      // Generate metadata
      const title = dog.name
        ? `${dog.name} - ${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${
            dog.breed
          }`
        : `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed}`;

      const description =
        dog.description ||
        `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed} จาก ${
          dog.locationName
        }`;

      // Get the first photo or use a default
      const imageUrl =
        dog.photos && dog.photos.length > 0
          ? dog.photos[0]
          : "https://www.haban.love/fbthumnail-1.png";

      // Use frontend URL for canonical URL
      const frontendUrl = process.env.FRONTEND_URL || "https://www.haban.love";
      const canonicalUrl = `${frontendUrl}/dogs/${dog._id}`;

      // Generate HTML with meta tags
      const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <meta name="description" content="${description}">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="${canonicalUrl}">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
          <meta property="og:locale" content="th_TH">
          <meta property="og:site_name" content="haban.love - ระบบแจ้งและตามหาสุนัขหาย">
          <meta property="fb:app_id" content="297302183484420">
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="${canonicalUrl}">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <meta name="twitter:image" content="${imageUrl}">
          
          <!-- Canonical -->
          <link rel="canonical" href="${canonicalUrl}">
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <img src="${imageUrl}" alt="${title}" style="max-width: 100%; border-radius: 8px;">
            <h1>${title}</h1>
            <p>${description}</p>
            <p><a href="${canonicalUrl}">View on haban.love</a></p>
          </div>
        </body>
        </html>
      `;

      return res.send(html);
    }

    // Regular JSON response
    res.json(dog);
  } catch (error) {
    console.error("Error fetching dog:", error);
    res.status(500).json({ message: "Error fetching dog" });
  }
};

export const updateDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;

    // Upload new photos if available and Firebase is configured
    if (req.files && Array.isArray(req.files)) {
      try {
        const uploadPromises = (req.files as Express.Multer.File[]).map(
          (file) => uploadToFirebase(file)
        );
        updates.photos = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading files to Firebase:", error);
        return res.status(500).json({
          message:
            "Error uploading files. Firebase Storage may not be configured properly.",
        });
      }
    }

    const dog = await dogService.getDogById(req.params.id);
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if user is authorized to update
    if (dog.userId && dog.userId !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this report" });
    }

    const updatedDog = await dogService.updateDog(req.params.id, updates);
    res.json(updatedDog);
  } catch (error) {
    console.error("Error updating dog:", error);
    res.status(500).json({ message: "Error updating dog" });
  }
};

export const deleteDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dog = await dogService.getDogById(req.params.id);
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if user is authorized to delete
    if (dog.userId && dog.userId !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this report" });
    }

    await dogService.deleteDog(req.params.id);
    res.json({ message: "Dog report deleted successfully" });
  } catch (error) {
    console.error("Error deleting dog:", error);
    res.status(500).json({ message: "Error deleting dog" });
  }
};

export const searchDogs = async (req: Request, res: Response) => {
  try {
    const { q, type, status } = req.query;

    const params: any = {};
    if (type) params.type = type;
    if (status) params.status = status;
    if (q) params.query = q as string;

    const dogs = await dogService.searchDogs(params);
    res.json(dogs);
  } catch (error) {
    console.error("Error searching dogs:", error);
    res.status(500).json({ message: "Error searching dogs" });
  }
};

export const updateDogStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { status } = req.body;
    const dog = await dogService.getDogById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if user is authorized to update status
    if (dog.userId && dog.userId !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this report" });
    }

    const updatedDog = await dogService.updateDogStatus(req.params.id, status);

    // Create a notification for the status update
    if (updatedDog && updatedDog.userId) {
      try {
        await createStatusUpdateNotification(
          updatedDog.userId.toString(),
          req.params.id,
          status
        );
      } catch (notificationError) {
        console.error(
          "Error creating status update notification:",
          notificationError
        );
        // Continue even if notification creation fails
      }
    }

    res.json(updatedDog);
  } catch (error) {
    console.error("Error updating dog status:", error);
    res.status(500).json({ message: "Error updating dog status" });
  }
};

/**
 * Save a dog to user's saved list
 */
export const saveDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid dog ID" });
    }

    // Check if the dog exists
    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Add the dog to the user's saved dogs if not already saved
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dogIdStr = dog._id.toString();
    // Check if dog is already saved
    const isDogSaved = user.savedDogs.some(
      (savedId) => savedId.toString() === dogIdStr
    );

    if (!isDogSaved) {
      user.savedDogs.push(dog._id);
      await user.save();
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving dog:", error);
    return res.status(500).json({ message: "Error saving dog" });
  }
};

/**
 * Remove a dog from user's saved list
 */
export const unsaveDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid dog ID" });
    }

    // Remove the dog from the user's saved dogs
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.savedDogs = user.savedDogs.filter((dogId) => dogId.toString() !== id);

    await user.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error removing saved dog:", error);
    return res.status(500).json({ message: "Error removing saved dog" });
  }
};

/**
 * Get all saved dogs for the current user
 */
export const getSavedDogs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Find user and populate the savedDogs reference
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has no saved dogs, return empty array
    if (!user.savedDogs.length) {
      return res.status(200).json([]);
    }

    // Get all saved dogs
    const savedDogs = await Dog.find({
      _id: { $in: user.savedDogs },
    });

    return res.status(200).json(savedDogs);
  } catch (error) {
    console.error("Error getting saved dogs:", error);
    return res.status(500).json({ message: "Error getting saved dogs" });
  }
};
