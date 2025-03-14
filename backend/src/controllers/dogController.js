const { dogService } = require("../services/dogService");
const { getFileUrl } = require("../utils/fileUtils");
const { uploadToFirebase, isFirebaseConfigured } = require("../utils/firebase");
const {
  createStatusUpdateNotification,
} = require("../services/notificationService");
const { findPotentialMatches } = require("../services/matchingService");

const createDog = async (req, res) => {
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
        const uploadPromises = req.files.map(async (file) => {
          try {
            // This will now return a placeholder URL if Firebase is not configured
            return await uploadToFirebase(file);
          } catch (error) {
            console.error(`Error uploading file ${file.originalname}:`, error);
            // Return a placeholder URL instead of failing
            return `https://via.placeholder.com/300?text=Upload+Error`;
          }
        });
        dogData.photos = await Promise.all(uploadPromises);
        console.log("Files processed successfully:", dogData.photos);
      } catch (error) {
        console.error("Error processing files:", error);
        // Continue with creating the dog, but with no photos
        dogData.photos = [];
      }
    }

    // Attach user ID to the dog data if authenticated
    if (req.user && req.user.id) {
      dogData.userId = req.user.id;
    }

    // Add expiry date (30 days from now) if not provided
    if (!dogData.expiryDate) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      dogData.expiryDate = expiryDate;
    }

    const dog = await dogService.createDog(dogData);

    // After creation, find potential matches
    try {
      await findPotentialMatches(dog);
    } catch (error) {
      console.error("Error finding potential matches:", error);
      // Don't fail the whole request if matching fails
    }

    return res.status(201).json(dog);
  } catch (error) {
    console.error("Error creating dog:", error);
    return res.status(500).json({
      message: "Failed to create dog listing",
      error: error.message,
    });
  }
};

const getDogs = async (req, res) => {
  try {
    console.log("getDogs called with query:", req.query);
    const { type, status = "active", lat, lng, radius, userId } = req.query;

    // Set up filter criteria
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    console.log("Filter criteria:", filter);

    // Location based filtering
    let geoFilter = null;
    if (lat && lng && radius) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const parsedRadius = parseFloat(radius);

      if (!isNaN(parsedLat) && !isNaN(parsedLng) && !isNaN(parsedRadius)) {
        geoFilter = {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parsedLng, parsedLat],
              },
              $maxDistance: parsedRadius * 1000, // Convert to meters
            },
          },
        };
        console.log("GeoFilter applied:", geoFilter);
      }
    }

    console.log(
      "Calling dogService.getDogs with filter:",
      geoFilter ? { ...filter, ...geoFilter } : filter
    );
    // Handle location filtering
    const dogs = await dogService.getDogs(
      geoFilter ? { ...filter, ...geoFilter } : filter
    );

    console.log(`Successfully retrieved ${dogs.length} dogs`);
    return res.status(200).json(dogs);
  } catch (error) {
    console.error("Detailed error in getDogs:", error);
    console.error("Error stack:", error.stack);
    console.error("Error getting dogs:", error.message);
    return res.status(500).json({
      message: "Failed to retrieve dog listings",
      error: error.message,
    });
  }
};

const getDog = async (req, res) => {
  try {
    const { id } = req.params;
    const dog = await dogService.getDogById(id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    return res.status(200).json(dog);
  } catch (error) {
    console.error(`Error getting dog by id ${req.params.id}:`, error);
    return res.status(500).json({
      message: "Failed to retrieve dog listing",
      error: error.message,
    });
  }
};

const updateDog = async (req, res) => {
  try {
    const { id } = req.params;
    const dogData = { ...req.body };

    // Parse location if it's a string
    if (typeof dogData.location === "string") {
      try {
        dogData.location = JSON.parse(dogData.location);
      } catch (error) {
        return res.status(400).json({ message: "Invalid location format" });
      }
    }

    // Get the existing dog
    const existingDog = await dogService.getDogById(id);
    if (!existingDog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if the user owns this dog
    if (existingDog.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized - You are not the owner of this listing",
      });
    }

    // Handle file uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(async (file) => {
          try {
            // This will now return a placeholder URL if Firebase is not configured
            return await uploadToFirebase(file);
          } catch (error) {
            console.error(`Error uploading file ${file.originalname}:`, error);
            // Return a placeholder URL instead of failing
            return `https://via.placeholder.com/300?text=Upload+Error`;
          }
        });
        const newPhotos = await Promise.all(uploadPromises);

        // If keeping old photos is specified, combine with existing ones
        if (dogData.keepExistingPhotos === "true" && existingDog.photos) {
          dogData.photos = [...existingDog.photos, ...newPhotos];
        } else {
          dogData.photos = newPhotos;
        }
      } catch (error) {
        console.error("Error processing files during update:", error);
        // Continue with updating the dog, but don't change photos
        delete dogData.photos;
      }
    } else if (dogData.keepExistingPhotos !== "true") {
      // If no new files and not keeping old photos, remove all photos
      dogData.photos = [];
    } else {
      // Keep existing photos and don't change
      delete dogData.photos;
    }

    // Remove fields that should not be updated
    delete dogData.keepExistingPhotos;
    delete dogData.userId; // User cannot change the owner

    const updatedDog = await dogService.updateDog(id, dogData);

    return res.status(200).json(updatedDog);
  } catch (error) {
    console.error(`Error updating dog ${req.params.id}:`, error);
    return res.status(500).json({
      message: "Failed to update dog listing",
      error: error.message,
    });
  }
};

const deleteDog = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the existing dog
    const existingDog = await dogService.getDogById(id);
    if (!existingDog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if the user owns this dog
    if (existingDog.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized - You are not the owner of this listing",
      });
    }

    await dogService.deleteDog(id);

    return res
      .status(200)
      .json({ message: "Dog listing deleted successfully" });
  } catch (error) {
    console.error(`Error deleting dog ${req.params.id}:`, error);
    return res.status(500).json({
      message: "Failed to delete dog listing",
      error: error.message,
    });
  }
};

const searchDogs = async (req, res) => {
  try {
    const { q, type, status = "active" } = req.query;

    const filter = {};
    if (q) filter.q = q;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const dogs = await dogService.searchDogs(filter);

    return res.status(200).json(dogs);
  } catch (error) {
    console.error("Error searching dogs:", error);
    return res.status(500).json({
      message: "Failed to search dog listings",
      error: error.message,
    });
  }
};

const updateDogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get the existing dog
    const existingDog = await dogService.getDogById(id);
    if (!existingDog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    // Check if the user owns this dog
    if (existingDog.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized - You are not the owner of this listing",
      });
    }

    // Update the status
    const updatedDog = await dogService.updateDog(id, { status });

    // Create a notification for the status update
    try {
      await createStatusUpdateNotification(
        existingDog.userId,
        existingDog._id,
        status,
        req.io
      );
    } catch (notificationError) {
      console.error(
        "Error creating status update notification:",
        notificationError
      );
      // Don't fail the whole request if notification creation fails
    }

    return res.status(200).json(updatedDog);
  } catch (error) {
    console.error(`Error updating dog status ${req.params.id}:`, error);
    return res.status(500).json({
      message: "Failed to update dog status",
      error: error.message,
    });
  }
};

module.exports = {
  createDog,
  getDogs,
  getDog,
  updateDog,
  deleteDog,
  searchDogs,
  updateDogStatus,
};
