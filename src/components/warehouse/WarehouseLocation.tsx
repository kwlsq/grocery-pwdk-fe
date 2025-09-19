'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SecureMapPicker } from '../map-picker'; // Update this path
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WarehouseLocationInputProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  defaultLocation?: { lat: number; lng: number };
}

export const WarehouseLocationInput: React.FC<WarehouseLocationInputProps> = ({
  onLocationSelect,
  defaultLocation = { lat: -6.9175, lng: 107.6191 } // Bandung default
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ description: string, placeId: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search places via your backend
  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/geocoding/places/autocomplete?input=${encodeURIComponent(query)}&language=id`);
      const data = await response.json();

      if (data.status === 'OK') {
        setSuggestions(data.predictions || []);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSelect = async (address: string) => {
    setInputValue(address);
    setShowSuggestions(false);
    setIsSearching(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/geocoding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;

        const location = { lat, lng, address: formattedAddress };
        setSelectedLocation(location);

        // Update input with formatted address
        setInputValue(formattedAddress);

        // Notify parent component
        onLocationSelect(formattedAddress, lat, lng);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection from MapPicker
  const handleMapLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setInputValue(location.address);

    // Notify parent component
    onLocationSelect(location.address, location.lat, location.lng);
  };

  // Handle manual address geocoding when user types and presses Enter
  const handleAddressSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !showSuggestions) {
      e.preventDefault();
      setIsSearching(true);

      try {
        const response = await fetch('http://localhost:8080/api/v1/geocoding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: inputValue.trim() })
        });

        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;

          const location = { lat, lng, address: formattedAddress };
          setSelectedLocation(location);
          setInputValue(formattedAddress);

          onLocationSelect(formattedAddress, lat, lng);
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Address Input Section */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
          Store Address
        </Label>

        <div className="relative">
          <Input
            id="address"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleAddressSubmit}
            placeholder="Start typing store address or press Enter to search..."
            autoComplete="off"
            className="w-full pr-10"
          />

          {/* Loading spinner in input */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.placeId}
                  onClick={() => handleSelect(suggestion.description)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-gray-400">📍</span>
                    <span className="text-sm text-gray-900">{suggestion.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500">
          💡 Type to search, select from suggestions, or click/drag on the map below
        </p>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="mr-3 text-green-600">✅</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Selected Store Location</p>
              <p className="text-sm text-green-700 mt-1">{selectedLocation.address}</p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Adjust Location on Map
        </Label>

        <SecureMapPicker
          onLocationSelect={handleMapLocationSelect}
          center={selectedLocation ?
            { lat: selectedLocation.lat, lng: selectedLocation.lng } :
            defaultLocation
          }
          defaultCenter={defaultLocation}
        />
      </div>
    </div>
  );
};