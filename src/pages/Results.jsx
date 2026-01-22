import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Download, Share2, Check, AlertCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg border-2 border-red-200 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-medium text-gray-900">Something went wrong</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        title={data?.city}
        subtitle={`${data?.totalDays} days • $${data?.budgetPerPerson}/person • ${data?.groupSize} travelers`}
        showBack
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="mb-8 bg-white border border-purple-200 rounded-lg p-6">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            Choose Your Adventure
          </h2>
          <p className="text-gray-600">
            We've created 3 different itinerary styles for you. Pick your favorite days from each 
            to create your perfect trip. Each day includes morning activities, afternoon exploration, 
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

        {/* COMPACT Summary Card */}
        {Object.keys(selectedDays).length > 0 && (
          <div className="bg-white rounded-lg border-2 border-purple-200 p-4 sticky bottom-4">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium text-gray-900">Your Itinerary</h2>
                <p className="text-sm text-gray-600">
                  {Object.keys(selectedDays).length} of {data.totalDays} days • ${totalSelectedCost}
                </p>
              </div>
              {isComplete && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="p-2 bg-white border border-stone-200 rounded-lg hover:border-purple-600 transition-colors"
                    title="Export"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => navigate('/flights', { 
                      state: { 
                        itinerary: data,
                        selectedItinerary: { 
                          days: getFinalItinerary(), 
                          totalCost: totalSelectedCost 
                        }
                      } 
                    })}
                    className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-medium text-sm"
                  >
                    Add Flights
                  </button>
                  <button
                    className="p-2 bg-white border border-stone-200 rounded-lg hover:border-purple-600 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Compact Stats - Single Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border border-stone-200">
                <p className="text-2xl font-medium text-gray-900">${totalSelectedCost}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg border border-stone-200">
                <p className="text-2xl font-medium text-gray-900">
                  {Object.keys(selectedDays).length}/{data.totalDays}
                </p>
                <p className="text-xs text-gray-500">Selected</p>
              </div>
              
              <div className={`text-center p-3 rounded-lg border ${
                totalSelectedCost <= data.budgetPerPerson 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-red-300 bg-red-50'
              }`}>
                <p className={`text-2xl font-medium ${
                  totalSelectedCost <= data.budgetPerPerson ? 'text-purple-600' : 'text-red-600'
                }`}>
                  {totalSelectedCost <= data.budgetPerPerson ? (
                    <Check className="w-6 h-6 mx-auto" />
                  ) : (
                    <AlertCircle className="w-6 h-6 mx-auto" />
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {totalSelectedCost <= data.budgetPerPerson ? 'On Track' : 'Over'}
                </p>
              </div>
            </div>

            {/* Collapsible Day List */}
            {getFinalItinerary().length > 0 && (
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-2 hover:bg-stone-50 rounded transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      View Selected Days ({getFinalItinerary().length})
                    </span>
                    <svg 
                      className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {getFinalItinerary().map((day, idx) => (
                    <div key={idx} className="border-l-2 border-purple-600 pl-3 py-1 text-sm">
                      <p className="font-medium text-gray-900">{day.title}</p>
                      <p className="text-xs text-gray-500">${day.estCost}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Complete message - Compact */}
            {isComplete && (
              <div className="mt-3 p-2 bg-purple-50 border border-purple-600 rounded text-center">
                <p className="text-sm text-purple-900 font-medium">
                  Ready to start your adventure
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}