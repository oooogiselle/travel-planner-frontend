import React from 'react';
import { Check } from 'lucide-react';

export default function DraftCard({ draft, selectedDays, onSelectDay }) {
  const isSelected = (dayNumber) => {
    const selected = selectedDays[dayNumber];
    return selected?.draftId === draft.id;
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 p-4">
        <h3 className="text-xl font-medium text-gray-900">{draft.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{draft.description}</p>
      </div>

      {/* Days */}
      <div className="p-4 space-y-3">
        {draft.days.map((day) => {
          const selected = isSelected(day.dayNumber);
          
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.dayNumber, draft.id, day.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selected
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-stone-200 bg-white hover:border-purple-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Day {day.dayNumber}
                    </span>
                    {selected && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white rounded text-xs">
                        <Check className="w-3 h-3" />
                        Selected
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 mt-1">{day.title}</h4>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-2 mb-3">
                {day.blocks.map((block, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide min-w-16">
                      {block.timeOfDay}
                    </span>
                    <span className="text-sm text-gray-700">{block.item.name}</span>
                  </div>
                ))}
              </div>

              {/* Cost */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <span className="text-xs text-gray-500">Estimated Cost</span>
                <span className="text-lg font-medium text-gray-900">${day.estCost}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-stone-50 border-t border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Cost</span>
          <span className="font-medium text-gray-900">
            ${draft.days.reduce((sum, day) => sum + day.estCost, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}