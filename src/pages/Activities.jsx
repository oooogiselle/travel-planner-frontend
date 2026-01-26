import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Sparkles, MapPin, Calendar, DollarSign, User, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function Activities() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!tripData || !tripData.city) {
      navigate('/');
      return;
    }

    // Generate initial itineraries
    generateInitialItineraries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateInitialItineraries = async () => {
    setIsGenerating(true);

    // Add welcome message
    const welcomeMsg = {
      role: 'assistant',
      content: `Hi! I see you're traveling to **${tripData.city}** from ${formatDate(tripData.checkIn)} to ${formatDate(tripData.checkOut)}. Let me create some personalized itineraries for you!`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);

    try {
      // Call backend to generate itineraries
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/activities/generate-itineraries`, {
        destination: tripData.city,
        checkIn: tripData.checkIn,
        checkOut: tripData.checkOut,
        travelers: tripData.travelers?.length || 1,
        hotel: tripData.selectedHotel?.name,
        hotelLocation: tripData.selectedHotel?.location,
        budget: tripData.totalCost,
        interests: tripData.interests || []
      });

      const itineraries = response.data.itineraries;

      // Add AI response with itineraries
      const aiMsg = {
        role: 'assistant',
        content: null,
        itineraries: itineraries,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to generate itineraries:', error);
      
      const errorMsg = {
        role: 'assistant',
        content: "I'm having trouble generating itineraries right now. Let me create some basic suggestions for you!",
        itineraries: getFallbackItineraries(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFallbackItineraries = () => {
    const city = tripData.city.toLowerCase();
    const nights = Math.ceil((new Date(tripData.checkOut) - new Date(tripData.checkIn)) / (1000 * 60 * 60 * 24));
    
    // City-specific fallbacks
    const cityItineraries = {
      tokyo: [
        {
          id: '1',
          title: '🗼 Classic Tokyo',
          description: 'Temples, sushi markets, traditional culture',
          vibe: 'cultural',
          days: [
            {
              day: 1,
              activities: [
                { time: '9:00 AM', name: 'Senso-ji Temple & Asakusa', type: 'attraction' },
                { time: '12:00 PM', name: 'Tsukiji Outer Market lunch', type: 'food' },
                { time: '2:00 PM', name: 'Imperial Palace Gardens', type: 'activity' },
                { time: '6:00 PM', name: 'Traditional izakaya dinner', type: 'food' }
              ]
            }
          ]
        },
        {
          id: '2',
          title: '🎮 Modern Tokyo',
          description: 'Tech, gaming, anime, trendy neighborhoods',
          vibe: 'modern',
          days: [
            {
              day: 1,
              activities: [
                { time: '10:00 AM', name: 'TeamLab Borderless Museum', type: 'attraction' },
                { time: '1:00 PM', name: 'Akihabara gaming & electronics', type: 'activity' },
                { time: '4:00 PM', name: 'Shibuya Crossing & shopping', type: 'activity' },
                { time: '7:00 PM', name: 'Robot Restaurant show', type: 'entertainment' }
              ]
            }
          ]
        },
        {
          id: '3',
          title: '🌸 Peaceful Tokyo',
          description: 'Gardens, tea, onsen, quiet temples',
          vibe: 'relaxed',
          days: [
            {
              day: 1,
              activities: [
                { time: '9:00 AM', name: 'Meiji Shrine & Yoyogi Park', type: 'nature' },
                { time: '12:00 PM', name: 'Traditional tea ceremony', type: 'cultural' },
                { time: '3:00 PM', name: 'Shinjuku Gyoen Gardens', type: 'nature' },
                { time: '6:00 PM', name: 'Onsen experience', type: 'wellness' }
              ]
            }
          ]
        }
      ],
      paris: [
        {
          id: '1',
          title: '🗼 Classic Paris',
          description: 'Eiffel, Louvre, cafes, romance',
          vibe: 'cultural',
          days: [
            {
              day: 1,
              activities: [
                { time: '9:00 AM', name: 'Eiffel Tower visit', type: 'attraction' },
                { time: '12:00 PM', name: 'Seine river lunch cruise', type: 'food' },
                { time: '2:00 PM', name: 'Louvre Museum', type: 'museum' },
                { time: '6:00 PM', name: 'Montmartre & Sacré-Cœur', type: 'attraction' }
              ]
            }
          ]
        },
        {
          id: '2',
          title: '🎨 Artistic Paris',
          description: 'Museums, galleries, creative districts',
          vibe: 'cultural',
          days: []
        },
        {
          id: '3',
          title: '🍷 Foodie Paris',
          description: 'Markets, bakeries, wine tasting, bistros',
          vibe: 'foodie',
          days: []
        }
      ]
    };

    // Default fallback for any city
    const defaultItineraries = [
      {
        id: '1',
        title: '🗺️ Top Attractions',
        description: 'Must-see landmarks and popular spots',
        vibe: 'cultural',
        days: []
      },
      {
        id: '2',
        title: '🍜 Food & Culture',
        description: 'Local cuisine and cultural experiences',
        vibe: 'foodie',
        days: []
      },
      {
        id: '3',
        title: '🌳 Off the Beaten Path',
        description: 'Hidden gems and local favorites',
        vibe: 'relaxed',
        days: []
      }
    ];

    // Try to find city-specific itineraries
    for (const [cityName, itineraries] of Object.entries(cityItineraries)) {
      if (city.includes(cityName)) {
        return itineraries;
      }
    }

    return defaultItineraries;
  };

  const parseItineraryFromText = (text) => {
    // Try to parse itinerary from AI's text response
    // This is a fallback if backend doesn't return structured data
    
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*"days"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.days && Array.isArray(parsed.days)) {
          return {
            id: `custom-${Date.now()}`,
            title: parsed.title || `Custom ${tripData.city} Itinerary`,
            description: 'AI-generated custom itinerary',
            vibe: 'custom',
            days: parsed.days
          };
        }
      }
      
      // If no JSON found, try to parse from formatted text
      // This is more complex - for now return null
      return null;
    } catch (error) {
      console.error('Failed to parse itinerary from text:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMsg = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsGenerating(true);

    try {
      // Send message to AI with context
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/activities/chat`, {
        message: inputMessage,
        context: {
          destination: tripData.city,
          checkIn: tripData.checkIn,
          checkOut: tripData.checkOut,
          selectedItinerary: selectedItinerary
        },
        conversationHistory: messages
      });

      const aiMsg = {
        role: 'assistant',
        content: response.data.message,
        itineraries: response.data.itineraries,
        generatedItinerary: response.data.generatedItinerary, // NEW: Custom itinerary from AI
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);

      // If AI generated a custom itinerary (not just the 3 cards), auto-select it
      if (response.data.generatedItinerary) {
        setSelectedItinerary(response.data.generatedItinerary);
      } else if (response.data.message) {
        // Fallback: Try to parse itinerary from text
        const parsedItinerary = parseItineraryFromText(response.data.message);
        if (parsedItinerary) {
          // Update the message to include the parsed itinerary
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].generatedItinerary = parsedItinerary;
            return updated;
          });
          setSelectedItinerary(parsedItinerary);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMsg = {
        role: 'assistant',
        content: "I'm having trouble responding right now. Could you try rephrasing that?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectItinerary = (itinerary) => {
    setSelectedItinerary(itinerary);
    
    const userMsg = {
      role: 'user',
      content: `I'd like to see the ${itinerary.title} itinerary`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
  };

  const handleContinue = () => {
    if (!selectedItinerary) return;

    navigate('/summary', {
      state: {
        ...tripData,
        itinerary: selectedItinerary
      }
    });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const nights = tripData.checkOut && tripData.checkIn
    ? Math.ceil((new Date(tripData.checkOut) - new Date(tripData.checkIn)) / (1000 * 60 * 60 * 24))
    : 1;

  if (!tripData) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        title="Plan Activities"
        subtitle={`${tripData.city} • ${nights} nights`}
        showBack
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Trip Summary Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Your Trip to {tripData.city}</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-80" />
              <div>
                <p className="opacity-80 text-xs">Dates</p>
                <p className="font-medium">{formatDate(tripData.checkIn)} - {formatDate(tripData.checkOut)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 opacity-80" />
              <div>
                <p className="opacity-80 text-xs">Travelers</p>
                <p className="font-medium">{tripData.travelers?.length || 1} people</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 opacity-80 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="opacity-80 text-xs">Hotel</p>
                    <p className="font-medium truncate max-w-[200px]">{tripData.selectedHotel?.name || 'Selected'}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 opacity-80" />
              <div>
                <p className="opacity-80 text-xs">Budget</p>
                <p className="font-medium">${Math.round(tripData.totalCost || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' ? (
                  <div className="max-w-3xl">
                    {/* AI Avatar */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        {/* Text Content */}
                        {message.content && (
                          <div className="bg-stone-50 rounded-2xl rounded-tl-sm px-4 py-3 mb-4">
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content.split('**').map((part, i) => 
                                i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Itinerary Cards */}
                        {message.itineraries && message.itineraries.length > 0 && (
                          <div className="space-y-3">
                            {message.itineraries.map((itinerary) => (
                              <ItineraryCard
                                key={itinerary.id}
                                itinerary={itinerary}
                                isSelected={selectedItinerary?.id === itinerary.id}
                                onSelect={() => handleSelectItinerary(itinerary)}
                              />
                            ))}
                          </div>
                        )}

                        {/* AI-Generated Custom Itinerary */}
                        {message.generatedItinerary && (
                          <div className="mt-4 border-2 border-green-500 rounded-xl overflow-hidden bg-white">
                            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Sparkles className="w-5 h-5" />
                                  <div>
                                    <h3 className="font-semibold text-lg">{message.generatedItinerary.title}</h3>
                                    <p className="text-sm opacity-90">Custom itinerary based on your preferences</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              {/* Show itinerary days */}
                              <div className="space-y-4 mb-4">
                                {message.generatedItinerary.days?.slice(0, 2).map((day, idx) => (
                                  <div key={idx}>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Day {day.day}</h4>
                                    <div className="space-y-2">
                                      {day.activities.slice(0, 3).map((activity, aidx) => (
                                        <div key={aidx} className="flex items-start gap-3 text-sm">
                                          <span className="text-green-600 font-medium min-w-[70px]">{activity.time}</span>
                                          <span className="text-gray-700">{activity.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                {message.generatedItinerary.days?.length > 2 && (
                                  <p className="text-xs text-gray-500">+ {message.generatedItinerary.days.length - 2} more days</p>
                                )}
                              </div>

                              <button
                                onClick={() => setSelectedItinerary(message.generatedItinerary)}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                Use This Itinerary
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md">
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-stone-50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600">Generating your itineraries...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-stone-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me to modify your itinerary..."
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={isGenerating}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGenerating}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {selectedItinerary && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selected Itinerary</p>
                <p className="text-xl font-semibold text-gray-900">{selectedItinerary.title}</p>
              </div>
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Continue to Summary
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ItineraryCard({ itinerary, isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const vibeEmojis = {
    cultural: '🏛️',
    modern: '🎮',
    relaxed: '🌸',
    adventure: '🏔️',
    foodie: '🍜'
  };

  const vibeColors = {
    cultural: 'from-amber-500 to-orange-500',
    modern: 'from-blue-500 to-cyan-500',
    relaxed: 'from-green-500 to-emerald-500',
    adventure: 'from-red-500 to-pink-500',
    foodie: 'from-purple-500 to-fuchsia-500'
  };

  return (
    <div
      className={`border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-600 shadow-lg'
          : 'border-stone-200 hover:border-purple-300 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${vibeColors[itinerary.vibe] || 'from-purple-500 to-blue-500'} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{vibeEmojis[itinerary.vibe] || '✨'}</span>
            <div>
              <h3 className="font-semibold text-lg">{itinerary.title}</h3>
              <p className="text-sm opacity-90">{itinerary.description}</p>
            </div>
          </div>
          {isSelected && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Selected
            </div>
          )}
        </div>
      </div>

      {/* Preview/Details */}
      <div className="p-4 bg-white">
        {isExpanded && itinerary.days && itinerary.days.length > 0 ? (
          <div className="space-y-4">
            {itinerary.days.slice(0, 2).map((day, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Day {day.day}</h4>
                <div className="space-y-2">
                  {day.activities.map((activity, aidx) => (
                    <div key={aidx} className="flex items-start gap-3 text-sm">
                      <span className="text-purple-600 font-medium min-w-[70px]">{activity.time}</span>
                      <span className="text-gray-700">{activity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {itinerary.days.length > 2 && (
              <p className="text-xs text-gray-500">+ {itinerary.days.length - 2} more days</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {itinerary.days?.length || Math.ceil((new Date(tripData.checkOut) - new Date(tripData.checkIn)) / (1000 * 60 * 60 * 24))} days of curated activities
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {isExpanded ? 'Show less' : 'View details'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}