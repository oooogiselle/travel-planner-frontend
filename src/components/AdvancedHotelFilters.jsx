// components/AdvancedHotelFilters.jsx
// Coordinate input + Radius slider + Multi-radius toggle

import React, { useState } from 'react';
import { MapPin, Search, Crosshair, Loader2 } from 'lucide-react';

export default function AdvancedHotelFilters({ 
  tripData, 
  onSearch,
  loading 
}) {
  const [searchMode, setSearchMode] = useState('city'); // 'city' or 'coordinates'
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  });
  const [radius, setRadius] = useState(20); // km
  const [multiRadius, setMultiRadius] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        setSearchMode('coordinates');
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please enter coordinates manually.');
        setGettingLocation(false);
      }
    );
  };

  // Common city coordinates (for quick selection)
  const cityCoordinates = {
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 },
  };

  const selectCity = (cityName) => {
    const coords = cityCoordinates[cityName];
    if (coords) {
      setCoordinates({
        latitude: coords.lat.toString(),
        longitude: coords.lng.toString()
      });
      setSearchMode('coordinates');
    }
  };

  const handleSearch = () => {
    if (searchMode === 'coordinates') {
      const lat = parseFloat(coordinates.latitude);
      const lng = parseFloat(coordinates.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid coordinates');
        return;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
        return;
      }

      onSearch({
        latitude: lat,
        longitude: lng,
        radius,
        multiRadius
      });
    } else {
      // City mode - use existing city search
      onSearch({
        cityCode: tripData.cityCode,
        radius,
        multiRadius
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-6">
      {/* Search Mode Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Search Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchMode('city')}
            className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
              searchMode === 'city'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-stone-200 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            🏙️ City Search
          </button>
          <button
            onClick={() => setSearchMode('coordinates')}
            className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
              searchMode === 'coordinates'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-stone-200 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            📍 Precise Location
          </button>
        </div>
      </div>

      {/* City Mode */}
      {searchMode === 'city' && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Searching near: {tripData.city}
              </p>
              <p className="text-xs text-gray-600">
                Switch to "Precise Location" to search a specific area
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Coordinate Mode */}
      {searchMode === 'coordinates' && (
        <div className="space-y-4">
          {/* Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={coordinates.latitude}
                onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="35.6762"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={coordinates.longitude}
                onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="139.6503"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {gettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
              {gettingLocation ? 'Getting location...' : 'Use my location'}
            </button>
          </div>

          {/* Quick City Selection */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Or select a city center:
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(cityCoordinates).map(city => (
                <button
                  key={city}
                  onClick={() => selectCity(city)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-xs"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates Preview */}
          {coordinates.latitude && coordinates.longitude && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-800">
                📍 {coordinates.latitude}, {coordinates.longitude}
              </p>
              <a
                href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-700 hover:text-green-800 underline mt-1 inline-block"
              >
                View on Google Maps →
                </a>
            </div>
          )}
        </div>
      )}

      {/* Radius Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Search Radius: <span className="text-purple-600 font-bold">{radius} km</span>
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>5 km</span>
          <span>25 km</span>
          <span>50 km</span>
          <span>75 km</span>
          <span>100 km</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {radius < 10 && '🔍 Very precise - hotels within walking distance'}
          {radius >= 10 && radius < 30 && '🏙️ City center - good selection of hotels'}
          {radius >= 30 && radius < 60 && '🗺️ Wide area - many hotels to choose from'}
          {radius >= 60 && '🌐 Maximum coverage - includes suburbs'}
        </p>
      </div>

      {/* Multi-Radius Toggle */}
      <div className="border border-stone-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={multiRadius}
            onChange={(e) => setMultiRadius(e.target.checked)}
            className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500 border-gray-300 mt-0.5"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm mb-1">
              Multi-radius search
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              Search multiple radiuses (25%, 50%, 100%, 150% of selected radius) to find more hotels.
              This will return 30-50 hotels instead of 10-20.
            </div>
            {multiRadius && (
              <div className="mt-2 text-xs text-purple-600 bg-purple-50 rounded px-2 py-1 inline-block">
                Will search: {Math.floor(radius * 0.25)}km, {Math.floor(radius * 0.5)}km, {radius}km, {Math.floor(radius * 1.5)}km
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading || (searchMode === 'coordinates' && (!coordinates.latitude || !coordinates.longitude))}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Hotels
          </>
        )}
      </button>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <p className="text-xs text-blue-800 leading-relaxed">
          💡 <strong>Tip:</strong> Use coordinate search for specific neighborhoods or landmarks. 
          Multi-radius search finds more hotels but may take a few seconds longer.
        </p>
      </div>
    </div>
  );
}