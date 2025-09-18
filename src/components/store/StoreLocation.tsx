'use client';

import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { MapPicker } from '../map-picker'; // Ensure this path is correct
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StoreLocationInputProps {
    onLocationSelect: (address: string, lat: number, lng: number) => void;
}

export const StoreLocationInput: React.FC<StoreLocationInputProps> = ({ onLocationSelect }) => {
    const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: 'id' }, // Bias search to Indonesia
        },
        debounce: 300,
    });

    const [mapCenter, setMapCenter] = useState({ lat: -6.9175, lng: 107.6191 }); // Default to Bandung

    // This handles when a user selects an address from the autocomplete dropdown
    const handleSelect = async (address: string) => {
        setValue(address, false); // Update the input field value
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            setMapCenter({ lat, lng });
            onLocationSelect(address, lat, lng); // Send the data up to the parent form
        } catch (error) {
            console.error("Error geocoding address:", error);
        }
    };

    // This handles when the user drags the pin on the map
    const handleMarkerDrag = async (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        if (lat && lng) {
            setMapCenter({ lat, lng });
            try {
                // Reverse geocode the new coordinates
                const results = await getGeocode({ location: { lat, lng } });
                const address = results[0].formatted_address;
                setValue(address, false); // Update the input field with the new address
                onLocationSelect(address, lat, lng); // Send the data up to the parent form
            } catch (error) {
                console.error("Error reverse geocoding:", error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Label htmlFor="address">Store Address</Label>
                <Input
                    id="address"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    placeholder="Start typing store address..."
                    autoComplete="off"
                />
                {/* This is the dropdown for the suggestions */}
                {status === 'OK' && (
                    <ul className="absolute bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-50 w-full">
                        {data.map(({ place_id, description }) => (
                            <li key={place_id} onClick={() => handleSelect(description)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                {description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <MapPicker center={mapCenter} onMarkerDragEnd={handleMarkerDrag} />
        </div>
    );
};

