import React from 'react';
import { DollarSign, MapPin, Clock } from 'lucide-react';

export default function DayCard({ day, isSelected, onSelect, draftId }) {
  const getTimeIcon = (timeOfDay) => {
    if (timeOfDay === 'morning') return '🌅';
    if (timeOfDay === 'afternoon') return '☀️';
    return '🌙';
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Day header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{day.title}</h4>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            <span>{day.estWalkTime || '2-3 hours'}</span>
          </div>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-700">
          <DollarSign className="w-4 h-4" />
          <span>{day.estCost}</span>
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-2 mb-4">
        {day.blocks.map((block, idx) => (
          <div key={idx} className="flex items-start text-sm">
            <span className="mr-2">{getTimeIcon(block.timeOfDay)}</span>
            <div className="flex-1">
              <span className="text-gray-500 capitalize text-xs">
                {block.timeOfDay}:
              </span>
              <p className="text-gray-700 font-medium">{block.item.name}</p>
              {block.item.description && (
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                  {block.item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Select button */}
      <button
        onClick={() => onSelect(day.dayNumber, draftId, day.id)}
        className={`w-full py-2 rounded-lg font-medium transition-all ${
          isSelected
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? '✓ Selected' : 'Use This Day'}
      </button>
    </div>
  );
}
