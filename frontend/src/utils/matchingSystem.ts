import { DogData } from "../services/api";

// Calculate distance between two coordinates in kilometers
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate time difference in days
const calculateTimeDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate similarity score between breed names (0-1)
const calculateBreedSimilarity = (breed1: string, breed2: string): number => {
  const b1 = breed1.toLowerCase();
  const b2 = breed2.toLowerCase();

  // Exact match
  if (b1 === b2) return 1;

  // One is substring of the other
  if (b1.includes(b2) || b2.includes(b1)) return 0.8;

  // Calculate word similarity
  const words1 = new Set(b1.split(" "));
  const words2 = new Set(b2.split(" "));
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

// Calculate similarity score between colors (0-1)
const calculateColorSimilarity = (color1: string, color2: string): number => {
  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();

  // Exact match
  if (c1 === c2) return 1;

  // One is substring of the other
  if (c1.includes(c2) || c2.includes(c1)) return 0.8;

  // Calculate word similarity
  const words1 = new Set(c1.split("-"));
  const words2 = new Set(c2.split("-"));
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

interface MatchScore {
  score: number;
  details: {
    breedScore: number;
    colorScore: number;
    locationScore: number;
    timeScore: number;
  };
}

export const calculateMatchScore = (
  lostDog: DogData,
  foundDog: DogData
): MatchScore => {
  // Calculate individual scores
  const breedScore = calculateBreedSimilarity(lostDog.breed, foundDog.breed);
  const colorScore = calculateColorSimilarity(lostDog.color, foundDog.color);

  // Calculate distance score (1 for 0km, 0 for >=10km)
  const distance = calculateDistance(
    lostDog.location.coordinates[1],
    lostDog.location.coordinates[0],
    foundDog.location.coordinates[1],
    foundDog.location.coordinates[0]
  );
  const locationScore = Math.max(0, 1 - distance / 10);

  // Calculate time difference score (1 for same day, 0.5 for 7 days, 0 for >14 days)
  const timeDiff = calculateTimeDifference(
    new Date(lostDog.lastSeen || ""),
    new Date(foundDog.foundDate || "")
  );
  const timeScore = Math.max(0, 1 - timeDiff / 14);

  // Calculate weighted average
  const weights = {
    breed: 0.3,
    color: 0.3,
    location: 0.25,
    time: 0.15,
  };

  const totalScore =
    breedScore * weights.breed +
    colorScore * weights.color +
    locationScore * weights.location +
    timeScore * weights.time;

  return {
    score: totalScore,
    details: {
      breedScore,
      colorScore,
      locationScore,
      timeScore,
    },
  };
};

export const findPotentialMatches = (
  targetDog: DogData,
  allDogs: DogData[],
  threshold: number = 0.6
): Array<{ dog: DogData; matchScore: MatchScore }> => {
  const oppositeType = targetDog.type === "lost" ? "found" : "lost";

  return allDogs
    .filter((dog) => dog.type === oppositeType && dog.status === "active")
    .map((dog) => ({
      dog,
      matchScore: calculateMatchScore(
        targetDog.type === "lost" ? targetDog : dog,
        targetDog.type === "found" ? targetDog : dog
      ),
    }))
    .filter((match) => match.matchScore.score >= threshold)
    .sort((a, b) => b.matchScore.score - a.matchScore.score);
};
