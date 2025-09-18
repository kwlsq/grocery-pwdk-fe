import apiClient from './apiClient'; // Use our central API client
import { Store,StoreRequestData } from '@/types/store'; // We will create these types next

/**
 * Fetches a list of all stores. Requires ADMIN role.
 */
export const getAllStores = () => {
  return apiClient.get<Store[]>('/stores');
};

/**
 * Creates a new store. Requires ADMIN role.
 * @param storeData The data for the new store.
 */
export const createStore = (storeData: StoreRequestData) => {
  return apiClient.post<Store>('/stores', storeData);
};

/**
 * Assigns a manager (user) to a specific store. Requires ADMIN role.
 * @param storeId The ID of the store.
 * @param userId The ID of the user to assign as manager.
 */
export const assignManager = (storeId: string, userId: string) => {
  return apiClient.post<Store>(`/stores/${storeId}/assign-manager`, { userId });
};

// Add functions for update and delete as you build those UI features