import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, DollarSign, ChevronDown, Sparkles, Loader } from 'lucide-react';
import { PREFERENCES, TRAVEL_STYLES } from '../utils/constants';
import AirportAutocomplete from '../components/AirportAutoComplete';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [naturalQuery, setNaturalQuery] = useState('');
  
  const [formData, setFormData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    travelers: [
      { 
        id: 1, 
        name: '', 
        origin: {
          code: '',
          city: '',
          country: '',
          displayText: ''
        },
        flightType: 'roundtrip',
        returnTo: null,
      }
    ],
    budgetPerPerson: 500,
    style: TRAVEL_STYLES.BALANCED,
    preferences: [],
  });

  const handleNaturalSearch = async (e) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setParsing(true);
    
    try {
      const response = await axios.post('http://localhost:3001/api/ai/parse-trip', {
        query: naturalQuery
      });

      const parsed = response.data;

      setFormData(prev => ({
        ...prev,
        city: parsed.city || prev.city,
        checkIn: parsed.checkIn || prev.checkIn,
        checkOut: parsed.checkOut || prev.checkOut,
        budgetPerPerson: parsed.budgetPerPerson || prev.budgetPerPerson,
        style: parsed.style || prev.style,
        preferences: parsed.preferences || prev.preferences,
        travelers: Array.from({ length: parsed.travelers || 1 }, (_, i) => ({
          id: i + 1,
          name: '',
          origin: { code: '', city: '', country: '', displayText: '' },
          flightType: 'roundtrip',
          returnTo: null,
        }))
      }));

      setShowDetails(true);

    } catch (error) {
      console.error('Parse error:', error);
      alert('Could not parse request. Please try again or fill manually.');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('travelPlannerQuery', JSON.stringify(formData));
    navigate('/flights', {
      state: {
        city: formData.city,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        travelers: formData.travelers.map(t => ({
          id: t.id,
          name: t.name,
          origin: t.origin.code || '',
          flightType: t.flightType || 'roundtrip',
          returnTo: t.returnTo?.code || null,
        })),
        budgetPerPerson: formData.budgetPerPerson,
        style: formData.style,
        preferences: formData.preferences,
      }
    });
  };

  const addTraveler = () => {
    setFormData(prev => ({
      ...prev,
      travelers: [...prev.travelers, { 
        id: prev.travelers.length + 1, 
        name: '', 
        origin: { code: '', city: '', country: '', displayText: '' },
        flightType: 'roundtrip',
        returnTo: null,
      }]
    }));
  };

  const removeTraveler = (id) => {
    if (formData.travelers.length > 1) {
      setFormData(prev => ({
        ...prev,
        travelers: prev.travelers.filter(t => t.id !== id)
      }));
    }
  };

  const updateTraveler = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const calculateDays = () => {
    if (formData.checkIn && formData.checkOut) {
      const diff = new Date(formData.checkOut) - new Date(formData.checkIn);
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-white text-xl font-bold">TripPlan</div>
          <button className="text-white hover:text-gray-200 transition-colors">
            My Trips
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div 
        className={`relative bg-cover bg-center flex items-center justify-center ${
          showDetails ? 'min-h-screen py-20' : 'h-screen'
        }`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 w-full">
          {!showDetails && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg text-center">
              Because group trips shouldn't be this hard.
            </h1>
          )}

          {!showDetails && (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleNaturalSearch}>
                <div className="relative">
                  <Sparkles className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                  <input
                    type="text"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    placeholder="Plan a 7 day trip to Paris with 2 friends..."
                    className="w-full pl-14 pr-6 py-5 rounded-full text-lg focus:ring-4 focus:ring-purple-300 focus:outline-none shadow-2xl"
                    disabled={parsing}
                    required
                  />
                  {parsing && (
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                    </div>
                  )}
                </div>
              </form>
              
              <div className="mt-6">
                <p className="text-white/80 text-sm mb-3 text-center">Try these examples:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNaturalQuery("plan a 7 day trip to Paris with 2 friends")}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full transition-colors"
                  >
                    7 days in Paris
                  </button>
                  <button
                    type="button"
                    onClick={() => setNaturalQuery("weekend trip to Tokyo, love food and culture")}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full transition-colors"
                  >
                    Weekend in Tokyo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNaturalQuery("luxury 10 day vacation in Bali")}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full transition-colors"
                  >
                    Luxury Bali
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDetails && (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <p className="text-xs text-purple-700 truncate flex-1">"{naturalQuery}"</p>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="text-purple-600 hover:text-purple-700 text-xs underline flex-shrink-0"
                  >
                    edit
                  </button>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium">{formData.city || 'No destination'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Check-in</label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none text-sm"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Check-out</label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none text-sm"
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {formData.checkIn && formData.checkOut && (
                  <p className="text-xs text-gray-600 text-center">{calculateDays()} days</p>
                )}

                {/* FLEXIBLE Travelers */}
                <div>
                  <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>Travelers ({formData.travelers.length})</span>
                    <button
                      type="button"
                      onClick={addTraveler}
                      className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                    >
                      + Add
                    </button>
                  </label>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {formData.travelers.map((traveler) => (
                      <div key={traveler.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex gap-2 items-center mb-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={traveler.name}
                            onChange={(e) => updateTraveler(traveler.id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none h-10"
                            required
                          />
                          {formData.travelers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTraveler(traveler.id)}
                              className="text-red-500 hover:text-red-700 text-sm px-2 flex-shrink-0 h-10 flex items-center"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="text-xs text-gray-600 mb-1 block">Departing from</label>
                          <AirportAutocomplete
                            value={traveler.origin.displayText}
                            onChange={(airport) => updateTraveler(traveler.id, 'origin', airport)}
                            placeholder="Home airport"
                            label=""
                          />
                        </div>

                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => updateTraveler(traveler.id, 'flightType', 'roundtrip')}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                              (traveler.flightType || 'roundtrip') === 'roundtrip'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-purple-600'
                            }`}
                          >
                            Round-trip
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTraveler(traveler.id, 'flightType', 'oneway')}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                              traveler.flightType === 'oneway'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-purple-600'
                            }`}
                          >
                            One-way
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTraveler(traveler.id, 'flightType', 'multicity')}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                              traveler.flightType === 'multicity'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-purple-600'
                            }`}
                          >
                            Multi-city
                          </button>
                        </div>

                        {traveler.flightType === 'multicity' && (
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Returning to</label>
                            <AirportAutocomplete
                              value={traveler.returnTo?.displayText || ''}
                              onChange={(airport) => updateTraveler(traveler.id, 'returnTo', airport)}
                              placeholder="Different return city"
                              label=""
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave blank to return to {traveler.origin.displayText || 'departure city'}
                            </p>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">
                            {traveler.flightType === 'oneway' && <span>✈️ One-way to {formData.city}</span>}
                            {(traveler.flightType === 'roundtrip' || !traveler.flightType) && (
                              <span>↔️ Round-trip from {traveler.origin.displayText || 'home'}</span>
                            )}
                            {traveler.flightType === 'multicity' && (
                              <span>
                                🌍 {traveler.origin.displayText || 'Home'} → {formData.city} → {traveler.returnTo?.displayText || traveler.origin.displayText || 'Home'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Budget per person</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={formData.budgetPerPerson}
                    onChange={(e) => setFormData({ ...formData, budgetPerPerson: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Travel style</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">Frugal</span>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        value={getStyleValue()}
                        onChange={(e) => handleStyleChange(e.target.value)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">Splurge</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold capitalize">
                        {formData.style}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES.map((pref) => (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => togglePreference(pref.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          formData.preferences.includes(pref.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-medium"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {!showDetails && !parsing && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-8 h-8 text-white opacity-75" />
            </div>
          )}
        </div>
      </div>

      {!showDetails && (
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Describe</h3>
                <p className="text-gray-600">AI understands your plans</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Add Travelers</h3>
                <p className="text-gray-600">Each person's home airport</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Book Flights</h3>
                <p className="text-gray-600">Find the best deals</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">4. Plan Activities</h3>
                <p className="text-gray-600">AI-powered itineraries</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>Powered by OpenAI • Amadeus • Foursquare • Mapbox</p>
        </div>
      </footer>
    </div>
  );
}