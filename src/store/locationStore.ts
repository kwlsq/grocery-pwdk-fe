"use client";

import { create } from 'zustand';

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface Coordinates {
  userLatitude: number;
  userLongitude: number;
}

interface LocationState {
  status: LocationStatus;
  coords: Coordinates | null;
  error: string | null;
  requestLocation: () => void;
  reset: () => void;
}

// Helper function to save to localStorage
const saveToStorage = (state: Partial<LocationState>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('freshgrocer-location', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving location to localStorage:', error);
    }
  }
};

// Helper function to load from localStorage
const loadFromStorage = (): Partial<LocationState> => {
  if (typeof window === 'undefined') {
    return { status: 'idle', coords: null, error: null };
  }
  
  try {
    const stored = localStorage.getItem('freshgrocer-location');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading location from localStorage:', error);
  }
  
  return { status: 'idle', coords: null, error: null };
};

export const useLocationStore = create<LocationState>((set) => {
  // Initialize from localStorage
  const initialState = loadFromStorage();

  return {
    status: (initialState.status as LocationStatus) || 'idle',
    coords: initialState.coords || null,
    error: initialState.error || null,

    requestLocation: () => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        const errorState = { status: 'error' as LocationStatus, error: 'Geolocation is not supported by this browser.' };
        set(errorState);
        saveToStorage(errorState);
        return;
      }

      const requestingState = { status: 'requesting' as LocationStatus, error: null };
      set(requestingState);
      saveToStorage(requestingState);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const successState = {
            status: 'granted' as LocationStatus,
            coords: { userLatitude: latitude, userLongitude: longitude },
            error: null,
          };
          set(successState);
          saveToStorage(successState);
        },
        (err) => {
          const message = err.code === err.PERMISSION_DENIED
            ? 'Permission denied. Please allow location access in your browser settings.'
            : err.message || 'Failed to get your location.';
          const errorState = { 
            status: err.code === err.PERMISSION_DENIED ? 'denied' as LocationStatus : 'error' as LocationStatus, 
            error: message 
          };
          set(errorState);
          saveToStorage(errorState);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },

    reset: () => {
      const resetState = { status: 'idle' as LocationStatus, coords: null, error: null };
      set(resetState);
      saveToStorage(resetState);
    }
  };
}); 