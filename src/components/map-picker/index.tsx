

'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '8px',
};


interface MapPickerProps {
  center: { lat: number; lng: number };
  onMarkerDragEnd: (e: google.maps.MapMouseEvent) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ center, onMarkerDragEnd }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyD5Ha5ZgwQgveEpQ0EsKwUaji8XtLhkcEE"
  });

  if (!isLoaded) return <div className="h-[250px] w-full bg-gray-200 flex items-center justify-center rounded-lg">Loading Map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center } zoom={17}>
      <Marker position={center } draggable={true} onDragEnd={onMarkerDragEnd} />
    </GoogleMap>
  );
}

