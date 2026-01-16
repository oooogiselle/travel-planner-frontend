import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Download, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import DraftCard from '../components/DraftCard';
import { geocodeCity, generateItinerary } from '../utils/api';

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedDays, setSelectedDays] = useState({});

  useEffect(() => {
    const queryData = sessionStorage.getItem('travelPlannerQuery');
    if (!queryData) {
      navigate('/');
      return;
    }

    const params = JSON.parse(queryData);
    fetchItinerary(params);
  }, [navigate]);

  const fetchItinerary = async (params) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Geocode the city
      const geoData = await geocodeCity(params.city);
      
      // Step 2: Generate itinerary with coordinates
      const itineraryData = await generateItinerary({
        city: geoData.city,
        lat: geoData.lat,
        lng: geoData.lng,
        days: params.days,
        budgetPerPerson: params.budgetPerPerson,
        style: params.style,
        preferences: params.preferences,
        groupSize: params.groupSize,
      });

      setData(itineraryData);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError(err.response?.data?.error || 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDay = (dayNumber, draftId, dayId) => {
    setSelectedDays(prev => ({
      ...prev,
      [dayNumber]: { draftId, dayId },
    }));
  };

  const getFinalItinerary = () => {
    if (!data) return [];
    
    const finalDays = [];
    for (let i = 1; i <= data.totalDays; i++) {
      const selected = selectedDays[i];
      if (selected) {
        const draft = data.drafts.find(d => d.id === selected.draftId);
        const day = draft?.days.find(d => d.id === selected.dayId);
        if (day) finalDays.push(day);
      }
    }
    return finalDays;
  };

  const totalSelectedCost = getFinalItinerary().reduce((sum, day) => sum + day.estCost, 0);
  const isComplete = Object.keys(selectedDays).length === data?.totalDays;

  const handleExport = () => {
    const finalItinerary = getFinalItinerary();
    const text = `My ${data.city} Trip\n\n` +
      finalItinerary.map((day, idx) => {
        const activities = day.blocks.map(b => `${b.timeOfDay}: ${b.item.name}`).join('\n  ');
        return `Day ${idx + 1}:\n  ${activities}\n  Cost: $${day.estCost}`;
      }).join('\n\n');
    
    // Create downloadable text file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.city}-itinerary.txt`;
    a.click();
  };

  if (loading) {
    return <LoadingSpinner message="Crafting your perfect itinerary..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        title={data?.city}
        subtitle={`${data?.totalDays} days • $${data?.budgetPerPerson}/person • ${data?.groupSize} travelers`}
        showBack
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Your Adventure 🎯
          </h2>
          <p className="text-gray-700">
            We've created 3 different itinerary styles for you. Pick your favorite days from each 
            to create your perfect trip! Each day includes morning activities, afternoon exploration, 
            and evening dining.
          </p>
        </div>

        {/* Drafts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {data?.drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              selectedDays={selectedDays}
              onSelectDay={handleSelectDay}
            />
          ))}
        </div>

        {/* Final Itinerary Summary */}
        {Object.keys(selectedDays).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Custom Itinerary</h2>
              {isComplete && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center text-green-700 mb-1">
                  <DollarSign className="w-5 h-5 mr-1" />
                  <span className="font-semibold">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-green-900">${totalSelectedCost}</p>
                <p className="text-sm text-green-600">${Math.round(totalSelectedCost / data.groupSize)} per person</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center text-blue-700 mb-1">
                  <Clock className="w-5 h-5 mr-1" />
                  <span className="font-semibold">Progress</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {Object.keys(selectedDays).length} / {data.totalDays}
                </p>
                <p className="text-sm text-blue-600">days selected</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center text-purple-700 mb-1">
                  <span className="font-semibold">Budget Status</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {totalSelectedCost <= data.budgetPerPerson ? '✓' : '!'} 
                  {totalSelectedCost <= data.budgetPerPerson ? ' On Track' : ' Over'}
                </p>
                <p className="text-sm text-purple-600">
                  {totalSelectedCost <= data.budgetPerPerson 
                    ? `$${data.budgetPerPerson - totalSelectedCost} remaining`
                    : `$${totalSelectedCost - data.budgetPerPerson} over budget`
                  }
                </p>
              </div>
            </div>

            {/* Selected Days Timeline */}
            {getFinalItinerary().length > 0 && (
              <div className="space-y-3">
                {getFinalItinerary().map((day, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                    <h4 className="font-semibold text-gray-900 mb-1">{day.title}</h4>
                    <p className="text-sm text-gray-600">
                      {day.blocks.map(b => b.item.name).join(' → ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">${day.estCost}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Complete message */}
            {isComplete && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold text-center">
                  🎉 Your itinerary is complete! Ready to start your adventure?
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
