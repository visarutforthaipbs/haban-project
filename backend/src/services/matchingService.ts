import Dog from "../models/Dog";
import { createMatchNotification } from "./notificationService";

/**
 * Find potential matches for a dog based on breed, color, and location
 * @param dogId ID of the dog to find matches for
 */
export const findPotentialMatches = async (dogId: string): Promise<void> => {
  try {
    // Get the dog
    const dog = await Dog.findById(dogId);
    if (!dog || !dog.userId) return;

    // Determine the type to search for (if lost, search for found dogs and vice versa)
    const searchType = dog.type === "lost" ? "found" : "lost";

    // Find potential matches based on breed and color
    const potentialMatches = await Dog.find({
      type: searchType,
      status: "active",
      breed: dog.breed,
      color: dog.color,
      // Don't match with own dogs
      userId: { $ne: dog.userId },
    });

    if (potentialMatches.length === 0) return;

    // Calculate match percentage and create notifications
    for (const match of potentialMatches) {
      if (!match.userId) continue;

      // Simple matching algorithm - in a real app, this would be more sophisticated
      let matchPercentage = 0;

      // 40% for breed match
      if (match.breed.toLowerCase() === dog.breed.toLowerCase()) {
        matchPercentage += 40;
      }

      // 30% for color match
      if (match.color.toLowerCase() === dog.color.toLowerCase()) {
        matchPercentage += 30;
      }

      // 30% for location proximity (simplified)
      if (
        dog.location &&
        match.location &&
        isLocationNearby(
          dog.location.coordinates,
          match.location.coordinates,
          10 // 10km radius
        )
      ) {
        matchPercentage += 30;
      }

      // Only create notification if match percentage is above threshold
      if (matchPercentage >= 60) {
        // Create notification for the owner of the matching dog
        await createMatchNotification(
          match.userId.toString(),
          match._id ? match._id.toString() : match.id.toString(),
          dogId,
          matchPercentage
        );

        // Also create notification for the owner of the original dog
        await createMatchNotification(
          dog.userId.toString(),
          dogId,
          match._id ? match._id.toString() : match.id.toString(),
          matchPercentage
        );
      }
    }
  } catch (error) {
    console.error("Error finding potential matches:", error);
  }
};

/**
 * Check if two locations are within a certain distance of each other
 * @param coords1 [longitude, latitude] of first location
 * @param coords2 [longitude, latitude] of second location
 * @param maxDistanceKm Maximum distance in kilometers
 */
const isLocationNearby = (
  coords1: [number, number],
  coords2: [number, number],
  maxDistanceKm: number
): boolean => {
  // Simple distance calculation using Haversine formula
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= maxDistanceKm;
};

/**
 * Convert degrees to radians
 */
const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};
