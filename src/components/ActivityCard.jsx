// components/ActivityCard.jsx
import React from 'react';
import { Clock, MapPin, Users, DollarSign, Star, ExternalLink } from 'lucide-react';

export default function ActivityCard({ activity, onSelect, isSelected }) {
  const categoryColors = {
    attraction: 'bg-blue-100 text-blue-700',
    food: 'bg-orange-100 text-orange-700',
    tour: 'bg-purple-100 text-purple-700',
    entertainment: 'bg-pink-100 text-pink-700',
    adventure: 'bg-green-100 text-green-700',
    culture: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-600 bg-purple-50'
          : 'border-stone-200 hover:border-purple-300'
      }`}
      onClick={onSelect}
    >
      {/* Image */}
      {activity.image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          {isSelected && (
            <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              ✓ Selected
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[activity.type] || 'bg-gray-100 text-gray-700'}`}>
            {activity.type}
          </span>
          {activity.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-gray-900">{activity.rating}</span>
              <span className="text-gray-500">({activity.reviews})</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{activity.name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {activity.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {activity.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{activity.duration}</span>
            </div>
          )}

          {activity.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>{activity.location}</span>
            </div>
          )}

          {activity.groupSize && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-purple-600" />
              <span>{activity.groupSize}</span>
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div>
            <p className="text-2xl font-medium text-gray-900">
              ${activity.pricePerPerson}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>

          <div className="flex gap-2">
            {activity.bookingUrl && (
              <a
                href={activity.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 border border-stone-200 rounded-lg hover:border-purple-600 transition-colors"
                title="View on provider"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                isSelected
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>

        {/* Provider */}
        {activity.provider && (
          <div className="mt-3 pt-3 border-t border-stone-200">
            <p className="text-xs text-gray-500">
              Provided by <span className="font-medium text-gray-700">{activity.provider}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}