import { Request, Response } from "express";
import { dogService } from "../services/dogService";
import { getFileUrl } from "../utils/fileUtils";
import { uploadToFirebase } from "../utils/firebase";
import { createStatusUpdateNotification } from "../services/notificationService";
import { findPotentialMatches } from "../services/matchingService";

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
