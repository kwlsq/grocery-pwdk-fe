import apiClient from './apiClient';
export const getProvinces = async () => {
  return apiClient.get('/locations/provinces');
};
export const getCitiesByProvinceId = async (provinceId: string | number) => {
  return apiClient.get(`/locations/cities/${provinceId}`);
};
