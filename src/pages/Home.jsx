import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, DollarSign, Sparkles } from 'lucide-react';
import { PREFERENCES, TRAVEL_STYLES } from '../utils/constants';

export default function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: '',
    days: 3,
    budgetPerPerson: 500,
    groupSize: 2,
    style: TRAVEL_STYLES.BALANCED,
    preferences: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store form data for the results page
    sessionStorage.setItem('travelPlannerQuery', JSON.stringify(formData));
    
    // Navigate to results
    navigate('/results');
  };

  const togglePreference = (prefId) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter(p => p !== prefId)
        : [...prev.preferences, prefId],
    }));
  };

  const handleStyleChange = (value) => {
    const styleMap = {
      0: TRAVEL_STYLES.BUDGET,
      1: TRAVEL_STYLES.BALANCED,
      2: TRAVEL_STYLES.PREMIUM,
    };
    setFormData({ ...formData, style: styleMap[parseInt(value)] });
  };

  const getStyleValue = () => {
    const valueMap = {
      [TRAVEL_STYLES.BUDGET]: 0,
      [TRAVEL_STYLES.BALANCED]: 1,
      [TRAVEL_STYLES.PREMIUM]: 2,
    };
    return valueMap[formData.style];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              ✈️ Travel Planner
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plan your perfect trip together with AI-powered itineraries
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>Get 3 different itinerary styles • Mix and match days • Stay on budget</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* City Input */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Where do you want to go?
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Paris, Tokyo, New York, Barcelona"
              className="input-field"
              required
            />
          </div>

          {/* Days and Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of Days */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Number of days
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                className="input-field"
                required
              />
            </div>

            {/* Budget per Person */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
                Budget per person
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={formData.budgetPerPerson}
                onChange={(e) => setFormData({ ...formData, budgetPerPerson: parseInt(e.target.value) || 100 })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Group size
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.groupSize}
              onChange={(e) => setFormData({ ...formData, groupSize: parseInt(e.target.value) || 1 })}
              className="input-field"
              required
            />
          </div>

          {/* Style Slider */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Travel style
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-medium">Frugal</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={getStyleValue()}
                  onChange={(e) => handleStyleChange(e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-medium">Splurge</span>
              </div>
              <div className="text-center mt-3">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                  {formData.style}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              What are you interested in?
            </label>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => togglePreference(pref.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.preferences.includes(pref.id)
                      ? 'bg-blue-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{pref.emoji}</span>
                  {pref.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full text-lg py-4 mt-6"
          >
            Generate Itineraries 🎉
          </button>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-500 mt-4">
            We'll create 3 different itinerary styles for you to mix and match
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Powered by Amadeus • Foursquare • Mapbox • OpenAI</p>
      </footer>
    </div>
  );
}
