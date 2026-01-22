import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Hotel, Star, MapPin, Wifi, Coffee, Dumbbell, UtensilsCrossed, Check, Users, Calendar, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

export default function Hotels() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state;

  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 1000,
    amenities: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Redirect if no trip data
  useEffect(() => {
    if (!tripData || !tripData.city) {
      navigate('/');
      return;
    }

    // Auto-search hotels on load
    searchHotels();
  }, [tripData, navigate]);

  // Get city code from city name (common cities)
  const getCityCode = (city) => {
    const cityMap = {
      'Paris': 'PAR',
      'New York': 'NYC',
      'London': 'LON',
      'Tokyo': 'TYO',
      'Barcelona': 'BCN',
      'Rome': 'ROM',
      'Amsterdam': 'AMS',
      'Los Angeles': 'LAX',
      'San Francisco': 'SFO',
      'Dubai': 'DXB',
      'Madrid': 'MAD',
      'Berlin': 'BER',
      'Singapore': 'SIN',
      'Hong Kong': 'HKG',
      'Sydney': 'SYD',
      'Miami': 'MIA',
      'Las Vegas': 'LAS',
      'Chicago': 'CHI',
      'Boston': 'BOS',
      'Seattle': 'SEA',
      'Lima': 'LIM',
      'Mexico City': 'MEX',
      'Buenos Aires': 'BUE',
      'São Paulo': 'SAO',
      'Rio de Janeiro': 'RIO',
      'Bogotá': 'BOG',
      'Santiago': 'SCL',
      'Toronto': 'YTO',
      'Vancouver': 'YVR',
      'Montreal': 'YMQ',
      'Atlanta': 'ATL',
      'Dallas': 'DFW',
      'Houston': 'HOU',
      'Denver': 'DEN',
      'Phoenix': 'PHX',
      'Philadelphia': 'PHL',
      'San Diego': 'SAN',
      'Washington': 'WAS',
      'Mumbai': 'BOM',
      'Delhi': 'DEL',
      'Bangkok': 'BKK',
      'Seoul': 'SEL',
      'Beijing': 'BJS',
      'Shanghai': 'SHA',
      'Istanbul': 'IST',
      'Moscow': 'MOW',
      'Frankfurt': 'FRA',
      'Munich': 'MUC',
      'Zurich': 'ZRH',
      'Vienna': 'VIE',
      'Brussels': 'BRU',
      'Copenhagen': 'CPH',
      'Stockholm': 'STO',
      'Oslo': 'OSL',
      'Athens': 'ATH',
      'Lisbon': 'LIS',
      'Dublin': 'DUB',
      'Edinburgh': 'EDI',
      'Manchester': 'MAN',
      'Milan': 'MIL',
      'Venice': 'VCE',
      'Naples': 'NAP',
      'Prague': 'PRG',
      'Budapest': 'BUD',
      'Warsaw': 'WAW',
      'Tel Aviv': 'TLV',
      'Cairo': 'CAI',
      'Johannesburg': 'JNB',
      'Cape Town': 'CPT',
      'Nairobi': 'NBO',
      'Casablanca': 'CAS',
      'Marrakech': 'RAK',
      'Doha': 'DOH',
      'Abu Dhabi': 'AUH',
      'Kuala Lumpur': 'KUL',
      'Jakarta': 'JKT',
      'Manila': 'MNL',
      'Ho Chi Minh City': 'SGN',
      'Hanoi': 'HAN',
      'Taipei': 'TPE',
      'Melbourne': 'MEL',
      'Brisbane': 'BNE',
      'Perth': 'PER',
      'Auckland': 'AKL',
    };
    
    // Try to match city name (case-insensitive, partial match)
    const cityLower = city.toLowerCase();
    for (const [cityName, code] of Object.entries(cityMap)) {
      if (cityLower.includes(cityName.toLowerCase()) || cityName.toLowerCase().includes(cityLower)) {
        return code;
      }
    }
    return '';
  };

  const searchHotels = async () => {
    setLoading(true);

    try {
      const cityCode = getCityCode(tripData.city);
      const params = {
        cityCode,
        checkIn: tripData.checkIn,
        checkOut: tripData.checkOut,
        adults: tripData.travelers.length,
        rooms: Math.ceil(tripData.travelers.length / 2), // 2 people per room by default
      };

      // Add filters if set
      if (filters.minRating > 0) {
        const ratings = [];
        for (let i = filters.minRating; i <= 5; i++) {
          ratings.push(i);
        }
        params.ratings = ratings.join(',');
      }

      if (filters.maxPrice < 1000) {
        params.priceRange = `0-${filters.maxPrice}`;
      }

      if (filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(',');
      }

      const response = await axios.get('/api/hotels/search', { params });
      setHotels(response.data.hotels);
    } catch (error) {
      console.error('Hotel search error:', error);
      alert('Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleContinue = () => {
    navigate('/activities', {
      state: {
        ...tripData,
        selectedHotel,
        totalFlightCost: tripData.totalFlightCost,
        totalHotelCost: selectedHotel.offer.price.total,
        totalCost: tripData.totalFlightCost + selectedHotel.offer.price.total,
      }
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      'WIFI': <Wifi className="w-4 h-4" />,
      'RESTAURANT': <UtensilsCrossed className="w-4 h-4" />,
      'FITNESS_CENTER': <Dumbbell className="w-4 h-4" />,
      'SWIMMING_POOL': <Coffee className="w-4 h-4" />,
      'PARKING': <MapPin className="w-4 h-4" />,
    };
    return amenityIcons[amenity] || null;
  };

  const formatAmenity = (amenity) => {
    return amenity.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const calculateNights = () => {
    const checkIn = new Date(tripData.checkIn);
    const checkOut = new Date(tripData.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && hotels.length === 0) {
    return <LoadingSpinner message="Finding the best hotels..." />;
  }

  if (!tripData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        title="Book Hotel"
        subtitle={`${tripData.city} • ${calculateNights()} nights • ${tripData.travelers.length} travelers`}
        showBack
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Trip Summary */}
        <div className="bg-white rounded-2xl p-8 mb-6 border border-stone-200">
          <h2 className="text-xl font-medium text-gray-900 mb-6">{tripData.city}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Check-in</p>
              <p className="font-medium text-gray-900">{formatDate(tripData.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Check-out</p>
              <p className="font-medium text-gray-900">{formatDate(tripData.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Travelers</p>
              <p className="font-medium text-gray-900">{tripData.travelers.length} people</p>
            </div>
          </div>
          {tripData.totalFlightCost && (
            <div className="mt-6 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Flights</span>
                <span className="font-medium text-purple-600">${tripData.totalFlightCost}</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-8 mb-6 border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-6">
              {/* Minimum Rating */}
              <div>
                <label className="block text-sm text-gray-700 mb-3">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilters({ ...filters, minRating: rating })}
                      className={`px-6 py-2.5 rounded-lg border transition-all text-sm ${
                        filters.minRating === rating
                          ? 'border-purple-600 text-purple-600 bg-white'
                          : 'border-stone-200 bg-white text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm text-gray-700 mb-3">
                  Max Price per Night: <span className="text-purple-600">${filters.maxPrice}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-purple-50 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>$50</span>
                  <span>$1000+</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm text-gray-700 mb-3 font-medium">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['WIFI', 'RESTAURANT', 'FITNESS_CENTER', 'SWIMMING_POOL'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, amenities: [...filters.amenities, amenity] });
                          } else {
                            setFilters({ ...filters, amenities: filters.amenities.filter(a => a !== amenity) });
                          }
                        }}
                        className="w-5 h-5 rounded text-purple-500 focus:ring-2 focus:ring-purple-400 border-gray-300"
                      />
                      <span className="text-sm font-medium">{formatAmenity(amenity)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={searchHotels}
                className="w-full py-3 rounded-lg bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40"
                disabled={loading}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Hotel Results */}
        {hotels.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {hotels.length} Hotels Available
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Best prices for your dates
                </p>
              </div>
              {selectedHotel && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Hotel selected</span>
                </div>
              )}
            </div>

            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className={`bg-white border-2 rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                  selectedHotel?.id === hotel.id
                    ? 'border-purple-500 shadow-lg'
                    : 'border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Hotel Image Placeholder */}
                  <div className="w-full md:w-80 h-64 bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center">
                    <Hotel className="w-16 h-16 text-purple-200" />
                  </div>

                  {/* Hotel Details */}
                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-2">{hotel.name}</h4>
                        <div className="flex items-center gap-3">
                          {renderStars(hotel.rating)}
                          <span className="text-sm text-gray-600">({hotel.rating} stars)</span>
                        </div>
                      </div>
                      {selectedHotel?.id === hotel.id && (
                        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-semibold">Selected</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">
                        {hotel.location.address}, {hotel.location.cityName}
                      </span>
                    </div>

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {hotel.amenities.slice(0, 6).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full font-medium"
                          >
                            {formatAmenity(amenity)}
                          </span>
                        ))}
                        {hotel.amenities.length > 6 && (
                          <span className="text-xs text-gray-500 px-3 py-1.5">
                            +{hotel.amenities.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Room Details */}
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 mb-5 border border-purple-100">
                      <div className="flex items-center gap-8 text-sm">
                        <div>
                          <span className="text-purple-600 text-xs uppercase tracking-wide font-semibold">Room</span>
                          <span className="font-medium ml-2 text-gray-900">{hotel.offer.roomType}</span>
                        </div>
                        {hotel.offer.boardType && (
                          <div>
                            <span className="text-purple-600 text-xs uppercase tracking-wide font-semibold">Board</span>
                            <span className="font-medium ml-2 text-gray-900">
                              {hotel.offer.boardType.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          ${hotel.offer.price.total}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">${(hotel.offer.price.total / calculateNights()).toFixed(2)}</span> per night · {calculateNights()} nights
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleSelectHotel(hotel)}
                          className={`w-full px-10 py-3 rounded-lg transition-all ${
                            selectedHotel?.id === hotel.id
                              ? 'bg-purple-600 text-white border-2 border-purple-600'
                              : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                          }`}
                        >
                          {selectedHotel?.id === hotel.id ? 'Selected' : 'Select Hotel'}
                        </button>
                        
                        {/* External Booking Links */}
                        <div className="flex gap-2">
                          <a
                            href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(tripData.city)}&checkin=${tripData.checkIn}&checkout=${tripData.checkOut}&group_adults=${tripData.travelers.length}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-white border border-purple-600 text-purple-600 text-xs rounded-lg hover:bg-purple-50 transition-all text-center"
                          >
                            Booking.com
                          </a>
                          <a
                            href={`https://www.hotels.com/search.do?destination=${encodeURIComponent(tripData.city)}&startDate=${tripData.checkIn}&endDate=${tripData.checkOut}&rooms=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-white border border-purple-600 text-purple-600 text-xs rounded-lg hover:bg-purple-50 transition-all text-center"
                          >
                            Hotels.com
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    {hotel.offer.policies?.cancellation && (
                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                        {hotel.offer.policies.cancellation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-purple-100 p-16 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Hotel className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button onClick={searchHotels} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl">
              Search Again
            </button>
          </div>
        )}

        {/* Continue Button */}
        {selectedHotel && (
          <div className="sticky bottom-6 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-purple-200 p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-medium text-gray-900 mb-3">{selectedHotel.name}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Flights</span>
                    <span className="font-medium text-gray-900">${tripData.totalFlightCost || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Hotel ({calculateNights()} nights)</span>
                    <span className="font-medium text-gray-900">${selectedHotel.offer.price.total}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-600 mb-1 uppercase tracking-wide">Total</p>
                <p className="text-4xl font-medium text-gray-900 mb-4">
                  ${(tripData.totalFlightCost || 0) + selectedHotel.offer.price.total}
                </p>
                <button
                  onClick={handleContinue}
                  className="px-10 py-3 bg-white border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                >
                  Continue to Activities
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}