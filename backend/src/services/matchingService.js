const Dog = require("../models/Dog");
const { createMatchNotification } = require("./notificationService");

/**
 * Find potential matches for a dog based on breed, color, and location
 * @param {string|object} dogId ID of the dog or the dog object itself
 */
const findPotentialMatches = async (dogId) => {
  try {
    // Get the dog (or use the dog object if it was passed directly)
    const dog = typeof dogId === "string" ? await Dog.findById(dogId) : dogId;
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
        dog.location.coordinates &&
        match.location.coordinates &&
        isLocationNearby(
          dog.location.coordinates,
          match.location.coordinates,
          10 // 10 km radius
        )
      ) {
        matchPercentage += 30;
      }

      // Create match notifications if it's a good match (> 50%)
      if (matchPercentage > 50) {
        // Create notification for the original dog owner
        await createMatchNotification(
          dog.userId,
          dog._id,
          match._id,
          matchPercentage
        );

        // Create notification for the match dog owner
        await createMatchNotification(
          match.userId,
          match._id,
          dog._id,
          matchPercentage
        );
      }
    }
  } catch (error) {
    console.error("Error finding potential matches:", error);
  }
};

/**
 * Check if two locations are near each other
 * @param {[number, number]} coords1 [lng, lat] of first location
 * @param {[number, number]} coords2 [lng, lat] of second location
 * @param {number} maxDistanceKm Maximum distance in kilometers
 */
const isLocationNearby = (coords1, coords2, maxDistanceKm) => {
  if (!coords1 || !coords2) return false;

  // Extract the coordinates
  const lng1 = coords1[0];
  const lat1 = coords1[1];
  const lng2 = coords2[0];
  const lat2 = coords2[1];

  // Calculate distance using Haversine formula
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
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
 * @param {number} value Degrees
 */
const toRad = (value) => {
  return (value * Math.PI) / 180;
};

module.exports = {
  findPotentialMatches,
  isLocationNearby,
};
