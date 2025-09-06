"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "../../store/locationStore";

const LocationPrompt = () => {
  const { status, error, requestLocation } = useLocationStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className="bg-yellow-50 border border-yellow-200 px-4 py-3 hidden"
      >
        placeholder
      </div>
    );
  }

  if (status === "granted") return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <p className="font-medium">Enable location for better results</p>
          <p className="text-sm text-yellow-700">
            We use your location to show availability and accurate delivery options near you.
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={requestLocation}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Allow Location
          </button>
          {status === "denied" && (
            <a
              href="https://support.google.com/chrome/answer/142065?hl=en"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-green-700 underline"
            >
              How to enable in browser
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPrompt;
