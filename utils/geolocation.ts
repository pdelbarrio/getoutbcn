/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest spot from a list of spots based on user location
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param spots Array of spots to search through
 * @returns Object with nearest spot and distance, or null if no spots
 */
export function findNearestSpot(
  userLat: number,
  userLon: number,
  spots: any[]
): { spot: any; distance: number } | null {
  if (!spots || spots.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  for (const spot of spots) {
    // Skip spots without valid coordinates
    if (!spot.latitude || !spot.longitude || 
        spot.latitude === 0 || spot.longitude === 0) {
      continue;
    }

    const distance = calculateDistance(
      userLat,
      userLon,
      spot.latitude,
      spot.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = spot;
    }
  }

  return nearest ? { spot: nearest, distance: minDistance } : null;
}
