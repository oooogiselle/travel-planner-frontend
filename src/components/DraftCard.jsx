import React from 'react';
import { DollarSign, Calendar } from 'lucide-react';
import DayCard from './DayCard';

export default function DraftCard({ draft, selectedDays, onSelectDay }) {
  const getStrategyColor = (strategy) => {
    if (strategy.includes('Budget')) return 'from-green-500 to-emerald-600';
    if (strategy.includes('Premium') || strategy.includes('Foodie')) return 'from-purple-500 to-pink-600';
    return 'from-blue-500 to-cyan-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getStrategyColor(draft.strategy)} text-white p-6`}>
        <h3 className="text-2xl font-bold mb-2">{draft.strategy}</h3>
        <p className="text-sm opacity-90 leading-relaxed">
          {draft.summary || `A ${draft.strategy.toLowerCase()} itinerary with carefully selected activities.`}
        </p>
        
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="font-semibold">${draft.totalCost}</span>
            <span className="ml-1 opacity-75">total</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{draft.days.length} days</span>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="p-4 space-y-4">
        {draft.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            draftId={draft.id}
            isSelected={selectedDays[day.dayNumber]?.dayId === day.id}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </div>
  );
}
