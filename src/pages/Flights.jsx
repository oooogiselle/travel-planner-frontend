import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

export default function Flights() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state;

  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [travelerSearches, setTravelerSearches] = useState([]);
  const [currentTravelerIndex, setCurrentTravelerIndex] = useState(0);
  const [cabinClass, setCabinClass] = useState('ECONOMY');
  const [expandedFlights, setExpandedFlights] = useState({});
  const [nonStopOnly, setNonStopOnly] = useState(false);

  const getCityAirportCode = (city = '') => {
    const cityMap = {
      Paris: 'CDG', 'New York': 'JFK', London: 'LHR', Tokyo: 'NRT', Barcelona: 'BCN',
      Rome: 'FCO', Amsterdam: 'AMS', 'Los Angeles': 'LAX', 'San Francisco': 'SFO',
      Dubai: 'DXB', Madrid: 'MAD', Berlin: 'BER', Singapore: 'SIN', Sydney: 'SYD',
    };
    const cityLower = String(city).toLowerCase();
    for (const [cityName, code] of Object.entries(cityMap)) {
      if (cityLower.includes(cityName.toLowerCase())) return code;
    }
    return '';
  };

  const getAirlineName = (code) => {
    const airlines = {
      AA: 'American Airlines', UA: 'United Airlines', DL: 'Delta Air Lines',
      BA: 'British Airways', AF: 'Air France', LH: 'Lufthansa', EK: 'Emirates',
      QR: 'Qatar Airways', SQ: 'Singapore Airlines', JL: 'Japan Airlines',
    };
    return airlines[code] || code;
  };

  const formatDuration = (duration = '') => {
    const match = String(duration).match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return String(duration);
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateTime) =>
    new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateTime) =>
    new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    if (!tripData || !tripData.travelers) {
      navigate('/');
      return;
    }

    const initializeSearches = async () => {
      let destinationCode = '';

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${API_URL}/api/flights/airports`, {
          params: { keyword: tripData.city },
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          const airports = response.data.filter((loc) => loc.type === 'AIRPORT');
          const cities = response.data.filter((loc) => loc.type === 'CITY');
          if (airports.length > 0) destinationCode = airports[0].iataCode;
          else if (cities.length > 0) destinationCode = cities[0].iataCode;
          else destinationCode = response.data[0].iataCode;
        }
      } catch (error) {
        console.error('Failed to fetch destination airport:', error);
      }

      if (!destinationCode) {
        destinationCode = getCityAirportCode(tripData.city);
      }

      const searches = (tripData.travelers || []).map((traveler) => ({
        travelerId: traveler.id,
        travelerName: traveler.name,
        origin: traveler.origin,
        destination: destinationCode,
        departDate: tripData.checkIn,
        returnDate: tripData.checkOut,
        flightType: traveler.flightType || 'roundtrip',
        returnTo: traveler.returnTo || null,
        selectedFlight: null,
        searchedFlights: [],
      }));

      setTravelerSearches(searches);
      setCurrentTravelerIndex(0);
      setFlights([]);
      setExpandedFlights({});
    };

    initializeSearches();
  }, [tripData, navigate]);

  const selectedCount = useMemo(
    () => travelerSearches.filter((t) => t.selectedFlight).length,
    [travelerSearches]
  );

  const progressPct = useMemo(() => {
    if (!travelerSearches.length) return 0;
    return (selectedCount / travelerSearches.length) * 100;
  }, [selectedCount, travelerSearches.length]);

  const getAllFlightsSelected = () =>
    travelerSearches.length > 0 && travelerSearches.every((t) => t.selectedFlight !== null);

  const getTotalFlightCost = () =>
    travelerSearches.reduce((total, traveler) => total + (traveler.selectedFlight?.price || 0), 0);

  const visibleFlights = useMemo(() => {
    if (!nonStopOnly) return flights;
    return flights.filter(
      (f) => f.outbound?.stops === 0 && (!f.returning || f.returning?.stops === 0)
    );
  }, [flights, nonStopOnly]);

  const handleSearchFlights = async (travelerIndex) => {
    setLoading(true);
    setCurrentTravelerIndex(travelerIndex);

    try {
      const params = travelerSearches[travelerIndex];
      if (!params?.origin || !params?.destination) {
        alert('Missing origin or destination airport code.');
        return;
      }

      const { flightType, returnTo } = params;

      let response;

      if (flightType === 'oneway') {
        // One-way flight
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${API_URL}/api/flights/search`, {
          params: {
            origin: params.origin,
            destination: params.destination,
            departDate: params.departDate,
            adults: 1,
            travelClass: cabinClass,
            nonStop: nonStopOnly.toString(),
            // No return date
          },
        });
      } else if (flightType === 'multicity') {
        // Multi-city: Search both legs separately
        const returnDestination = returnTo || params.origin;
        
        const [outboundRes, returnRes] = await Promise.all([
          axios.get('http://localhost:3001/api/flights/search', {
            params: {
              origin: params.origin,
              destination: params.destination,
              departDate: params.departDate,
              adults: 1,
              travelClass: cabinClass,
              nonStop: nonStopOnly.toString(),
            },
          }),
          axios.get('http://localhost:3001/api/flights/search', {
            params: {
              origin: params.destination,
              destination: returnDestination,
              departDate: params.returnDate,
              adults: 1,
              travelClass: cabinClass,
              nonStop: nonStopOnly.toString(),
            },
          }),
        ]);

        // Combine results (simplified - you may want to pair them)
        const combined = (outboundRes.data?.flights || []).map((outbound, idx) => ({
          ...outbound,
          isMultiCity: true,
          returnLeg: (returnRes.data?.flights || [])[idx] || null,
        }));

        response = { data: { flights: combined } };
      } else {
        // Round-trip (default)
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        response = await axios.get(`${API_URL}/api/flights/search`, {
          params: {
            origin: params.origin,
            destination: params.destination,
            departDate: params.departDate,
            returnDate: params.returnDate,
            adults: 1,
            travelClass: cabinClass,
            nonStop: nonStopOnly.toString(),
          },
        });
      }

      const nextFlights = response?.data?.flights || [];

      const updatedSearches = [...travelerSearches];
      updatedSearches[travelerIndex] = {
        ...updatedSearches[travelerIndex],
        searchedFlights: nextFlights,
      };

      setTravelerSearches(updatedSearches);
      setFlights(nextFlights);
      setExpandedFlights({});
    } catch (error) {
      console.error('Flight search error:', error);
      alert('Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight, travelerIndex) => {
    const updatedSearches = [...travelerSearches];
    updatedSearches[travelerIndex] = {
      ...updatedSearches[travelerIndex],
      selectedFlight: flight,
    };

    setTravelerSearches(updatedSearches);
    setFlights([]);

    const nextIndex = travelerIndex + 1;
    if (nextIndex < updatedSearches.length && !updatedSearches[nextIndex].selectedFlight) {
      setCurrentTravelerIndex(nextIndex);
    }
  };

  const handleContinueToHotels = () => {
    navigate('/hotels', {
      state: {
        ...tripData,
        selectedFlights: travelerSearches,
        totalFlightCost: getTotalFlightCost(),
      },
    });
  };

  if (loading) return <LoadingSpinner message="Searching for the best flights..." />;
  if (!tripData) return null;

  const current = travelerSearches[currentTravelerIndex];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        title="Book Flights"
        subtitle={`${tripData.city} • ${tripData.travelers.length} travelers`}
        showBack
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-900">Flight Selection</h2>
            <span className="text-sm text-gray-600">
              {selectedCount} of {travelerSearches.length}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Traveler Tabs */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-stone-200">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {travelerSearches.map((traveler, index) => (
              <button
                key={traveler.travelerId}
                onClick={() => {
                  setCurrentTravelerIndex(index);
                  if (!traveler.selectedFlight) {
                    setFlights(traveler.searchedFlights || []);
                  } else {
                    setFlights([]);
                  }
                }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm border ${
                  currentTravelerIndex === index
                    ? 'bg-purple-600 text-white border-purple-600'
                    : traveler.selectedFlight
                    ? 'bg-white text-purple-600 border-purple-600'
                    : 'bg-white text-gray-700 border-stone-200 hover:border-purple-300'
                }`}
              >
                {traveler.travelerName}
                {traveler.selectedFlight && currentTravelerIndex !== index && ' ✓'}
              </button>
            ))}
          </div>

          {/* Current Traveler */}
          {current && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-medium text-gray-900">{current.travelerName}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  current.flightType === 'oneway' ? 'bg-blue-100 text-blue-700' :
                  current.flightType === 'multicity' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {current.flightType === 'oneway' ? 'One-way' :
                   current.flightType === 'multicity' ? 'Multi-city' : 'Round-trip'}
                </span>
              </div>

              {/* Route */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-stone-200">
                <div className="grid grid-cols-3 gap-6 items-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2 uppercase">From</p>
                    <p className="text-2xl font-medium text-gray-900">{current.origin}</p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-full h-px bg-stone-200 relative">
                      <Plane className="w-4 h-4 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2 uppercase">To</p>
                    <p className="text-2xl font-medium text-gray-900">{current.destination}</p>
                    <p className="text-xs text-gray-500 mt-2">{tripData.city}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-stone-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Depart</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(current.departDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                  {current.flightType !== 'oneway' && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase">
                        Return{current.flightType === 'multicity' && current.returnTo ? ` to ${current.returnTo}` : ''}
                      </p>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(current.returnDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cabin Class */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-3">Cabin Class</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'ECONOMY', label: 'Economy' },
                    { value: 'PREMIUM_ECONOMY', label: 'Premium' },
                    { value: 'BUSINESS', label: 'Business' },
                    { value: 'FIRST', label: 'First' },
                  ].map((classOption) => (
                    <button
                      key={classOption.value}
                      onClick={() => setCabinClass(classOption.value)}
                      className={`py-2.5 px-3 rounded-lg border transition-all text-sm ${
                        cabinClass === classOption.value
                          ? 'border-purple-600 text-purple-600 bg-white'
                          : 'border-stone-200 bg-white text-gray-700 hover:border-purple-300'
                      }`}
                      type="button"
                    >
                      {classOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nonstop Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 hover:border-purple-300 transition-all bg-white">
                  <input
                    type="checkbox"
                    checked={nonStopOnly}
                    onChange={(e) => setNonStopOnly(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-900">Nonstop flights only</span>
                  <Plane className="w-5 h-5 text-purple-400" />
                </label>
              </div>

              {/* Selected or Search */}
              {current.selectedFlight ? (
                <div className="border border-purple-600 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-purple-600 mb-1">Selected Flight</p>
                      <p className="text-lg font-medium text-gray-900">
                        {current.selectedFlight.outbound.departure.airport} →{' '}
                        {current.selectedFlight.outbound.arrival.airport}
                      </p>
                    </div>
                    <p className="text-2xl font-medium text-gray-900">
                      ${current.selectedFlight.price}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...travelerSearches];
                      updated[currentTravelerIndex] = {
                        ...updated[currentTravelerIndex],
                        selectedFlight: null,
                      };
                      setTravelerSearches(updated);
                      setFlights(updated[currentTravelerIndex].searchedFlights || []);
                    }}
                    className="text-purple-600 text-sm hover:text-purple-700"
                  >
                    Change selection
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSearchFlights(currentTravelerIndex)}
                  className="w-full py-3 rounded-lg bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
                  disabled={loading}
                >
                  Search Flights
                </button>
              )}
            </div>
          )}
        </div>

        {/* Flight Results */}
        {visibleFlights.length > 0 && current && !current.selectedFlight && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {visibleFlights.length} Available Flights
              </h3>
            </div>

            {visibleFlights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white border border-stone-200 rounded-lg p-6 hover:border-purple-600 transition-all cursor-pointer"
                onClick={() => handleSelectFlight(flight, currentTravelerIndex)}
              >
                {/* Flight Details */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    {/* Outbound */}
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-2xl font-medium text-gray-900">
                          {flight.outbound.departure.airport}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{formatTime(flight.outbound.departure.time)}</p>
                      </div>

                      <div className="flex-1 text-center px-4">
                        <p className="text-xs text-gray-500 mb-2">{formatDuration(flight.outbound.duration)}</p>
                        <div className="flex items-center justify-center">
                          <div className="h-px bg-stone-200 flex-1" />
                          <Plane className="w-3 h-3 text-purple-600 mx-3" />
                          <div className="h-px bg-stone-200 flex-1" />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {flight.outbound.stops === 0 ? 'Nonstop' : `${flight.outbound.stops} stop(s)`}
                        </p>
                      </div>

                      <div>
                        <p className="text-2xl font-medium text-gray-900">{flight.outbound.arrival.airport}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatTime(flight.outbound.arrival.time)}</p>
                      </div>
                    </div>

                    {/* Return (if not one-way) */}
                    {flight.returning && current.flightType !== 'oneway' && (
                      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-stone-200">
                        <div>
                          <p className="text-2xl font-medium text-gray-900">
                            {flight.returning.departure.airport}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatTime(flight.returning.departure.time)}
                          </p>
                        </div>

                        <div className="flex-1 text-center px-4">
                          <p className="text-xs text-gray-500 mb-2">{formatDuration(flight.returning.duration)}</p>
                          <div className="flex items-center justify-center">
                            <div className="h-px bg-stone-200 flex-1" />
                            <Plane className="w-3 h-3 text-purple-600 mx-3 transform rotate-180" />
                            <div className="h-px bg-stone-200 flex-1" />
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {flight.returning.stops === 0 ? 'Nonstop' : `${flight.returning.stops} stop(s)`}
                          </p>
                        </div>

                        <div>
                          <p className="text-2xl font-medium text-gray-900">
                            {flight.returning.arrival.airport}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatTime(flight.returning.arrival.time)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-6 md:mt-0 md:ml-12 text-center md:text-right">
                    <p className="text-3xl font-medium text-gray-900 mb-3">${flight.price}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFlight(flight, currentTravelerIndex);
                      }}
                      className="px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                    >
                      Select Flight
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue */}
        {getAllFlightsSelected() && (
          <div className="sticky bottom-6 bg-white rounded-lg border-2 border-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-medium text-gray-900 mb-3">All travelers booked</p>
                <div className="space-y-1.5">
                  {travelerSearches.map((t) => (
                    <p key={t.travelerId} className="text-sm text-gray-600">
                      {t.travelerName}: <span className="font-medium text-gray-900">${t.selectedFlight?.price}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-purple-600 mb-1 uppercase">Total</p>
                <p className="text-4xl font-medium text-gray-900 mb-4">${getTotalFlightCost()}</p>
                <button
                  type="button"
                  onClick={handleContinueToHotels}
                  className="px-10 py-3 bg-white border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                >
                  Continue to Hotels
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}