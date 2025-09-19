'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface Suggestion {
  description: string;
  placeId: string;
}

interface MapPickerProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  defaultCenter?: { lat: number; lng: number };
  center?: { lat: number; lng: number }; // Add this line

}

export const SecureMapPicker: React.FC<MapPickerProps> = ({ 
  onLocationSelect,
  defaultCenter = { lat: -6.2088, lng: 106.8456 },
   center 
}) => {
  const [mapCenter, setMapCenter] = useState(center || defaultCenter);
   useEffect(() => {
    if (center && (center.lat !== mapCenter.lat || center.lng !== mapCenter.lng)) {
      setMapCenter(center);
      
      // Also pan the map if it's loaded
      if (mapRef.current) {
        mapRef.current.panTo(center);
        mapRef.current.setZoom(17);
      }
    }
  }, [center, mapCenter.lat, mapCenter.lng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyD5Ha5ZgwQgveEpQ0EsKwUaji8XtLhkcEE"
  });

  // Debounced search function
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

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300); // 300ms delay
  };

  // Geocode selected place
  const selectPlace = async (description: string) => {
    setSearchQuery(description);
    setShowSuggestions(false);
    setIsSearching(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/geocoding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: description })
      });
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        const address = data.results[0].formatted_address;
        
setMapCenter({ lat, lng });
        setSelectedAddress(address);
        
        // Pan map to location
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(17);
        }
        
        // Notify parent component
        onLocationSelect?.({ lat, lng, address });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle marker drag
  const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
setMapCenter({ lat, lng });
      
      // Reverse geocode to get address
      try {
        const response = await fetch('http://localhost:8080/api/v1/geocoding/reverse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng })
        });
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results[0]) {
          const address = data.results[0].formatted_address;
          setSelectedAddress(address);
          setSearchQuery(address);
          
          onLocationSelect?.({ lat, lng, address });
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }
    }
  };

  // Handle map click
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    handleMarkerDragEnd(e);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-[500px] w-full bg-gray-200 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for places in Indonesia..."
            className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Loading spinner */}
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeId || index}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => selectPlace(suggestion.description)}
              >
                <div className="flex items-center">
                  <div className="mr-3 text-gray-400">
                    📍
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="mr-3 text-blue-600">📍</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{selectedAddress}</p>
              <p className="text-xs text-blue-600 mt-1">
Coordinates: {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
center={mapCenter}         
 zoom={17}
          onLoad={(map) => { mapRef.current = map; }}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker 
position={mapCenter}            
draggable={true} 
            onDragEnd={handleMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        </GoogleMap>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center">
        💡 Search for an address, click on the map, or drag the marker to select a location
      </div>
    </div>
  );
};