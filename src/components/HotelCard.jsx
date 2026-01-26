// components/HotelCard.jsx - WITH PHOTO SUPPORT
import React from 'react';
import { MapPin, Star, Wifi, Car, Coffee, Dumbbell } from 'lucide-react';

export default function HotelCard({ hotel, onSelect, isSelected }) {
  // Get first photo (should be from Google Places enrichment)
  const photo = hotel.photos?.[0] || 
                hotel.media?.[0]?.uri || 
                `https://source.unsplash.com/800x600/?hotel,${encodeURIComponent(hotel.name)}`;

  // Format price
  const totalPrice = hotel.offer?.price?.total || 0;
  const perNightPrice = hotel.offer?.price?.perNight || 0;

  // Get amenities
  const amenities = hotel.amenities?.slice(0, 4) || [];

  // Amenity icons
  const amenityIcons = {
    'WIFI': <Wifi className="w-4 h-4" />,
    'PARKING': <Car className="w-4 h-4" />,
    'RESTAURANT': <Coffee className="w-4 h-4" />,
    'GYM': <Dumbbell className="w-4 h-4" />,
    'wifi': <Wifi className="w-4 h-4" />,
    'parking': <Car className="w-4 h-4" />,
    'restaurant': <Coffee className="w-4 h-4" />,
    'gym': <Dumbbell className="w-4 h-4" />,
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-purple-600 bg-purple-50'
          : 'border-stone-200 hover:border-purple-300'
      }`}
    >
      {/* Hotel Photo */}
      <div className="relative h-48 bg-stone-200 overflow-hidden">
        <img
          src={photo}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to Unsplash if image fails to load
            e.target.src = `https://source.unsplash.com/800x600/?hotel,luxury`;
          }}
        />
        
        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            ✓ Selected
          </div>
        )}

        {/* Enriched Badge (for debugging) */}
        {hotel.enriched && (
          <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            Enhanced
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        {/* Rating */}
        {hotel.rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{hotel.rating}</span>
            </div>
            {hotel.reviewCount && (
              <span className="text-sm text-gray-500">
                ({hotel.reviewCount.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}

        {/* Hotel Name */}
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
          {hotel.name}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {hotel.location?.address || hotel.location?.cityName || 'Location not specified'}
          </span>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.map((amenity, index) => {
              const amenityKey = amenity.toUpperCase();
              const icon = amenityIcons[amenityKey] || amenityIcons[amenity];
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-stone-100 rounded text-xs text-gray-700"
                >
                  {icon}
                  <span className="capitalize">{amenity.replace(/_/g, ' ').toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Room Type */}
        {hotel.offer?.roomType && (
          <p className="text-sm text-gray-600 mb-3">
            {hotel.offer.roomType}
          </p>
        )}

        {/* Price */}
        <div className="pt-3 border-t border-stone-200">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-medium text-gray-900">
                ${totalPrice.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                ${perNightPrice} per night
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>

        {/* Website Link (if available) */}
        {hotel.website && (
          <div className="mt-3 pt-3 border-t border-stone-200">
            <a
              href={hotel.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
            >
              Visit hotel website →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}