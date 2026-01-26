import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ChevronDown, Sparkles, Loader, Send } from 'lucide-react';
import { PREFERENCES, TRAVEL_STYLES } from '../utils/constants';
import AirportAutocomplete from '../components/AirportAutocomplete';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../firebase/auth';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [naturalQuery, setNaturalQuery] = useState('');
  const [parsing, setParsing] = useState(false);
  
  // Chat mode
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Form mode
  const [showDetails, setShowDetails] = useState(false);
  
  const [formData, setFormData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    travelers: [
      { 
        id: 1, 
        name: '', 
        origin: { code: '', city: '', country: '', displayText: '' },
        flightType: 'roundtrip',
        returnTo: null,
      }
    ],
    budgetPerPerson: 500,
    style: TRAVEL_STYLES.BALANCED,
    preferences: [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, isAI = false, type = 'text', options = null) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      content,
      isAI,
      type,
      options,
      timestamp: new Date()
    }]);
  };

  /**
   * TRUE CONVERSATIONAL AI: Parse every message with context
   */
  const handleChatInput = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const input = chatInput.trim();
    setChatInput('');
    addMessage(input, false);
    setIsThinking(true);

    try {
      // Send message + current context to AI
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/ai/parse-trip`, {
        query: input,
        context: {
          city: formData.city,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          travelers: formData.travelers.length,
          budget: formData.budgetPerPerson,
          interests: formData.preferences
        }
      });

      if (!response.data?.success) {
        throw new Error('Parse failed');
      }

      const parsed = response.data.data;
      console.log('🤖 AI extracted:', parsed);

      // Merge NEW info with EXISTING info
      const updated = {
        ...formData,
        city: parsed.destination || formData.city,
        checkIn: parsed.checkIn || formData.checkIn,
        checkOut: parsed.checkOut || formData.checkOut,
        budgetPerPerson: parsed.budget || formData.budgetPerPerson,
        preferences: [...new Set([...formData.preferences, ...(parsed.interests || [])])],
        // Update travelers if specified
        travelers: parsed.travelers > 0 ? Array.from({ length: parsed.travelers }, (_, i) => ({
          id: i + 1,
          name: '',
          origin: { code: '', city: '', country: '', displayText: '' },
          flightType: 'roundtrip',
          returnTo: null,
        })) : formData.travelers,
      };

      setFormData(updated);

      // Check if destination is ambiguous (country instead of city)
      if (!parsed.destination && parsed.destinationOptions && parsed.destinationOptions.length > 0) {
        setTimeout(() => {
          addMessage(
            `Great! I see you want to visit ${parsed.destinationCountry}. Which city? 🌍`,
            true,
            'options',
            parsed.destinationOptions.map(city => ({ label: city, value: city }))
          );
          setIsThinking(false);
        }, 500);
        return;
      }

      // What NEW info did we just learn?
      const newInfo = [];
      if (parsed.destination && !formData.city) newInfo.push(`destination (${parsed.destination})`);
      if (parsed.checkIn && !formData.checkIn) {
        const nights = Math.ceil((new Date(parsed.checkOut) - new Date(parsed.checkIn)) / (1000 * 60 * 60 * 24));
        newInfo.push(`dates (${nights} nights)`);
      }
      if (parsed.travelers && parsed.travelers !== formData.travelers.length) {
        newInfo.push(`${parsed.travelers} ${parsed.travelers === 1 ? 'person' : 'people'}`);
      }
      if (parsed.budget && parsed.budget !== formData.budgetPerPerson) {
        newInfo.push(`budget ($${parsed.budget}/person)`);
      }
      if (parsed.interests && parsed.interests.length > 0) {
        newInfo.push(`interests (${parsed.interests.join(', ')})`);
      }

      if (newInfo.length > 0) {
        // We learned something new!
        setTimeout(() => {
          addMessage(`Perfect! Got: ${newInfo.join(', ')}! ✨`, true);
          
          // ALWAYS proceed to next question in order
          askNextQuestionInOrder(updated);
        }, 500);
      } else {
        // Didn't extract anything new - still move to next question
        setTimeout(() => {
          askNextQuestionInOrder(updated);
        }, 500);
      }

    } catch (error) {
      console.error('Parse error:', error);
      setTimeout(() => {
        addMessage("Sorry, I had trouble understanding. Could you try again?", true);
        setIsThinking(false);
      }, 500);
    }
  };

  /**
   * Ask questions in STRICT ORDER:
   * 1. Destination
   * 2. Dates
   * 3. Travelers
   * 4. Budget
   * 5. Interests
   * 6. Summary → Form
   */
  const askNextQuestionInOrder = (data) => {
    console.log('🔄 Checking next question. Current data:', {
      city: data.city,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      travelers: data.travelers.length,
      budget: data.budgetPerPerson,
      interests: data.preferences.length
    });

    // STRICT ORDER: Ask each question if not answered
    
    // 1. Destination
    if (!data.city) {
      setTimeout(() => {
        addMessage("Where would you like to go? 🌍", true);
        setIsThinking(false);
      }, 300);
      return;
    }

    // 2. Dates
    if (!data.checkIn || !data.checkOut) {
      setTimeout(() => {
        addMessage("When are you planning to go? 📅", true);
        addMessage("(e.g., 'March 15-18' or 'next month for a week')", true);
        setIsThinking(false);
      }, 300);
      return;
    }

    // 3. Travelers
    if (!data.travelers || data.travelers.length === 0) {
      setTimeout(() => {
        addMessage("How many people are traveling? 👥", true, 'options', [
          { label: '✈️ Just me', value: 1 },
          { label: '👫 2 people', value: 2 },
          { label: '👨‍👩‍👦 3 people', value: 3 },
          { label: '👨‍👩‍👧‍👦 4 people', value: 4 },
          { label: '👥 5+ people', value: 5 },
        ]);
        setIsThinking(false);
      }, 300);
      return;
    }

    // 4. Budget
    if (!data.budgetPerPerson || data.budgetPerPerson <= 500) {
      setTimeout(() => {
        addMessage("What's your budget per person? 💰", true, 'options', [
          { label: '💵 Budget ($500-1000)', value: 750 },
          { label: '💳 Moderate ($1000-2000)', value: 1500 },
          { label: '💎 Comfortable ($2000-3000)', value: 2500 },
          { label: '✨ Luxury ($3000+)', value: 4000 },
        ]);
        setIsThinking(false);
      }, 300);
      return;
    }

    // 5. Interests (optional but always ask)
    if (data.preferences.length === 0) {
      setTimeout(() => {
        addMessage("What are you interested in? (Pick all that apply, or skip) 🎯", true, 'interests');
        setIsThinking(false);
      }, 300);
      return;
    }

    // 6. All questions answered - show summary and form
    console.log('✅ All questions answered!');
    finalizeTripSummary(data);
  };

  /**
   * Show final summary and transition to form
   */
  const finalizeTripSummary = (data) => {
    console.log('🎯 Finalizing trip summary!', data);
    
    const nights = Math.ceil((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24));
    
    setTimeout(() => {
      addMessage(
        `Awesome! ✨ Here's your complete trip:\n\n` +
        `📍 ${data.city}\n` +
        `📅 ${new Date(data.checkIn).toLocaleDateString()} - ${new Date(data.checkOut).toLocaleDateString()} (${nights} nights)\n` +
        `👥 ${data.travelers.length} ${data.travelers.length === 1 ? 'person' : 'people'}\n` +
        `💰 $${data.budgetPerPerson}/person\n` +
        `${data.preferences.length > 0 ? `🎯 ${data.preferences.join(', ')}\n` : ''}\n` +
        `Ready to add traveler details!`,
        true
      );
      setIsThinking(false);
      
      console.log('🎯 Setting showDetails to TRUE in 1 second...');
      setTimeout(() => {
        console.log('🎯 NOW showing details form!');
        setShowDetails(true);
      }, 1000);
    }, 500);
  };

  /**
   * Handle option button clicks - treat like typing
   */
  const handleOptionClick = (value, label) => {
    // User clicked button - simulate typing
    setChatInput(label);
    
    // Auto-submit
    setTimeout(() => {
      const form = document.querySelector('form[onSubmit]');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 50);
  };

  const togglePreference = (prefId) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter(p => p !== prefId)
        : [...prev.preferences, prefId],
    }));
  };

  const handleInterestsDone = () => {
    const selected = formData.preferences.length > 0
      ? formData.preferences.map(p => PREFERENCES.find(pref => pref.id === p)?.label).join(', ')
      : "I'll explore everything!";
    
    addMessage(selected, false);
    setIsThinking(true);
    
    // Use current formData state and proceed in order
    setTimeout(() => {
      askNextQuestionInOrder(formData);
    }, 100);
  };

  const handleLogout = async () => {
    const result = await logOut();
    if (result.success) {
      console.log('✅ Logged out successfully');
      // Stay on home page
    }
  };

  const handleNaturalSearch = async (e) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setParsing(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/ai/parse-trip`, {
        query: naturalQuery
      });

      if (!response.data?.success) throw new Error('Parse failed');

      const parsed = response.data.data;

      // TRANSITION TO CHAT MODE
      setShowChat(true);
      setIsThinking(true);
      
      // Add initial user message
      addMessage(naturalQuery, false);

      // Build initial data
      const initialData = {
        ...formData,
        city: parsed.destination || formData.city,
        checkIn: parsed.checkIn || formData.checkIn,
        checkOut: parsed.checkOut || formData.checkOut,
        budgetPerPerson: parsed.budget || formData.budgetPerPerson,
        travelers: Array.from({ length: parsed.travelers || 1 }, (_, i) => ({
          id: i + 1,
          name: '',
          origin: { code: '', city: '', country: '', displayText: '' },
          flightType: 'roundtrip',
          returnTo: null,
        })),
        preferences: parsed.interests || formData.preferences,
      };

      setFormData(initialData);

      // Ambiguous destination?
      if (!parsed.destination && Array.isArray(parsed.destinationOptions) && parsed.destinationOptions.length > 0) {
        setTimeout(() => {
          addMessage(
            `Great! I see you want to visit ${parsed.destinationCountry}. Which city? 🌍`,
            true,
            'options',
            parsed.destinationOptions.map(city => ({ label: city, value: city }))
          );
          setIsThinking(false);
        }, 800);
        return;
      }

      // Destination clear?
      if (parsed.destination) {
        setTimeout(() => {
          addMessage(`Perfect! Let's plan your trip to ${parsed.destination}! 🎉`, true);
          askNextQuestionInOrder(initialData);
        }, 800);
        return;
      }

      // No destination
      setTimeout(() => {
        addMessage("I'd love to help! Where would you like to go? 🌍", true);
        setIsThinking(false);
      }, 800);

    } catch (error) {
      console.error('Parse error:', error);
      alert('Could not parse request. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  // Form handlers (keep your existing ones)
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

  const handleStyleChange = (value) => {
    const styleMap = {
      0: TRAVEL_STYLES.BUDGET,
      1: TRAVEL_STYLES.BALANCED,
      2: TRAVEL_STYLES.PREMIUM,
    };
    setFormData(prev => ({ ...prev, style: styleMap[parseInt(value, 10)] }));
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
      {/* Landing Page - unchanged from your original */}
      {!showChat && !showDetails && (
        <>
          <header className="absolute top-0 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="text-white text-xl font-bold">TripPlan</div>
              <div className="flex gap-3 items-center">
                {currentUser ? (
                  <>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="text-white hover:text-gray-200 transition-colors px-4 py-2"
                    >
                      My Trips
                    </button>
                    <span className="text-white text-sm">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-white hover:text-gray-200 transition-colors px-4 py-2"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => navigate('/signup')}
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          <div
            className="relative bg-cover bg-center flex items-center justify-center h-screen"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
            }}
          >
            <div className="max-w-4xl mx-auto px-4 w-full">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg text-center">
                Because group trips shouldn't be this hard.
              </h1>

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
                      onClick={() => setNaturalQuery('plan a 7 day trip to Paris with 2 friends')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full transition-colors"
                    >
                      7 days in Paris
                    </button>
                    <button
                      type="button"
                      onClick={() => setNaturalQuery('weekend trip to Iceland')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full transition-colors"
                    >
                      Weekend in Iceland
                    </button>
                    <button
                      type="button"
                      onClick={() => setNaturalQuery('luxury 10 day vacation in Bali')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm rounded-full transition-colors"
                    >
                      Luxury Bali
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-8 h-8 text-white opacity-75" />
              </div>
            </div>
          </div>

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
                  <h3 className="text-xl font-semibold mb-2">2. Chat</h3>
                  <p className="text-gray-600">Answer a few questions</p>
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

          <footer className="bg-gray-50 py-8">
            <div className="text-center text-gray-500 text-sm">
              <p>Powered by Google Gemini • Amadeus • Foursquare • Mapbox</p>
            </div>
          </footer>
        </>
      )}

      {/* TRUE CONVERSATIONAL CHAT - AI parses everything! */}
      {showChat && !showDetails && (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">TripPlan</span>
              </div>
              <button
                onClick={() => {
                  setShowChat(false);
                  setMessages([]);
                  setNaturalQuery('');
                  setIsThinking(false);
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Start Over
              </button>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Let's Plan Your Trip!</h1>
                <p className="text-purple-100">Just chat naturally - I'll understand! 💬</p>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[80%] ${
                        msg.isAI ? 'bg-white' : 'bg-purple-600 text-white'
                      } rounded-2xl px-4 py-3 shadow-sm`}
                    >
                      {msg.type === 'text' && (
                        <p className={`text-sm whitespace-pre-line ${msg.isAI ? 'text-gray-800' : 'text-white'}`}>
                          {msg.content}
                        </p>
                      )}

                      {msg.type === 'options' && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-800 mb-3">{msg.content}</p>
                          {Array.isArray(msg.options) && msg.options.length > 0 && (
                            <div className="grid grid-cols-1 gap-2">
                              {msg.options.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleOptionClick(opt.value, opt.label)}
                                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm font-medium text-left"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {msg.type === 'interests' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-800 mb-3">{msg.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {PREFERENCES.map((pref) => (
                              <button
                                key={pref.id}
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
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={handleInterestsDone}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              Continue →
                            </button>
                            <button
                              onClick={() => {
                                setFormData(prev => ({ ...prev, preferences: [] }));
                                handleInterestsDone();
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input - ALWAYS ENABLED! */}
              <form onSubmit={handleChatInput} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isThinking ? "Processing..." : "Type anything... I'll understand! 💬"}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:outline-none text-sm"
                    disabled={isThinking}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isThinking}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  💡 Click quick options or type naturally - AI extracts everything!
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details form - Complete traveler details */}
      {showDetails && (
        <div
          className="relative bg-cover bg-center flex items-center justify-center min-h-screen py-20"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          <div className="max-w-2xl mx-auto px-4 w-full">
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
                  <span className="font-medium">{formData.city || 'Destination pending'}</span>
                </div>
                {formData.city && <p className="text-xs text-green-600 mt-1">✓ Destination set</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Check-in</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none text-sm"
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {formData.checkIn && formData.checkOut && (
                <p className="text-xs text-gray-600 text-center">{calculateDays()} days</p>
              )}

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
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetPerPerson: parseInt(e.target.value, 10) || 100 }))}
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
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg"
              >
                Find Flights ✈️
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}