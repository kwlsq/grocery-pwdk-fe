import apiClient from './apiClient';
export const getProvinces = async () => {
  return apiClient.get('/locations/provinces');
};
export const getCitiesByProvinceId = async (provinceId: string | number) => {
  return apiClient.get(`/locations/cities/${provinceId}`);
};
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await apiClient.get('/geocode', {
      params: { address }
    });
    return response.data; // The backend directly returns the { lat, lng } object
  } catch (error) {
    console.error("Backend Geocoding error:", error);
    return null;
  }
};

/**
 * Reverse Geocoding: Converts coordinates into a human-readable street address by calling our backend proxy.
 * @param lat The latitude.
 * @param lng The longitude.
 * @returns The formatted street address, or null if not found.
 */
export const reverseGeocodeCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await apiClient.get('/geocode/reverse', {
      params: { lat, lng }
    });
    return response.data; // The backend directly returns the address string
  } catch (error) {
    console.error("Backend Reverse Geocoding error:", error);
    return null;
  }
};