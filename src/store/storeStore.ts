import { create } from 'zustand';
import { Store,StoreRequestData } from '@/types/store';
import { getAllStores, createStore } from '../services/storeService';

interface StoreState {
    stores: Store[];
    loading: boolean;
    error: string | null;
    fetchStores: () => Promise<void>;
    addStore: (newStoreData: StoreRequestData) => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
    stores: [],
    loading: false,
    error: null,
    fetchStores: async () => {
        set({ loading: true, error: null });
        try {
            const response = await getAllStores();
            set({ stores: response.data, loading: false });
        } catch (err) {
            set({ error: 'Failed to fetch stores.', loading: false });
        }
    },
    addStore: async (newStoreData) => {
        try {
            const response = await createStore(newStoreData);
            set(state => ({ stores: [...state.stores, response.data] }));
        } catch (err) {
            console.error("Failed to add store", err);
            throw err; // Re-throw so the form can display an error
        }
    },
}));