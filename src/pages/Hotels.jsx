import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Hotel as HotelIcon,
  Star,
  MapPin,
  Wifi,
  Coffee,
  Dumbbell,
  UtensilsCrossed,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import AdvancedHotelFilters from '../components/AdvancedHotelFilters';
import axios from 'axios';

export default function Hotels() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state;

  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPricePerNight: 500,
    amenities: [],
  });

  // details cache (by hotelId)
  const [detailsById, setDetailsById] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!tripData || !tripData.city) {
      navigate('/');
      return;
    }
    searchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nights = useMemo(() => {
    if (!tripData?.checkIn || !tripData?.checkOut) return 1;
    const checkIn = new Date(tripData.checkIn);
    const checkOut = new Date(tripData.checkOut);
    const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [tripData]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const money = (value, currency = 'USD') => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `$${n.toFixed(0)}`;
    }
  };

  // ====== City code mapping ======
  const getCityCode = (city) => {
    const cityMap = {
      Paris: 'PAR',
      'New York': 'NYC',
      London: 'LON',
      Tokyo: 'TYO',
      Barcelona: 'BCN',
      Rome: 'ROM',
      Amsterdam: 'AMS',
      'Los Angeles': 'LAX',
      'San Francisco': 'SFO',
      Dubai: 'DXB',
      Madrid: 'MAD',
      Berlin: 'BER',
      Singapore: 'SIN',
      'Hong Kong': 'HKG',
      Sydney: 'SYD',
      Miami: 'MIA',
      'Las Vegas': 'LAS',
      Chicago: 'CHI',
      Boston: 'BOS',
      Seattle: 'SEA',
      Lima: 'LIM',
      'Mexico City': 'MEX',
      'Buenos Aires': 'BUE',
      'São Paulo': 'SAO',
      'Rio de Janeiro': 'RIO',
      Bogotá: 'BOG',
      Santiago: 'SCL',
      Toronto: 'YTO',
      Vancouver: 'YVR',
      Montreal: 'YMQ',
      Atlanta: 'ATL',
      Dallas: 'DFW',
      Houston: 'HOU',
      Denver: 'DEN',
      Phoenix: 'PHX',
      Philadelphia: 'PHL',
      'San Diego': 'SAN',
      Washington: 'WAS',
      Mumbai: 'BOM',
      Delhi: 'DEL',
      Bangkok: 'BKK',
      Seoul: 'SEL',
      Beijing: 'BJS',
      Shanghai: 'SHA',
      Istanbul: 'IST',
      Moscow: 'MOW',
      Frankfurt: 'FRA',
      Munich: 'MUC',
      Zurich: 'ZRH',
      Vienna: 'VIE',
      Brussels: 'BRU',
      Copenhagen: 'CPH',
      Stockholm: 'STO',
      Oslo: 'OSL',
      Athens: 'ATH',
      Lisbon: 'LIS',
      Dublin: 'DUB',
      Edinburgh: 'EDI',
      Manchester: 'MAN',
      Milan: 'MIL',
      Venice: 'VCE',
      Naples: 'NAP',
      Prague: 'PRG',
      Budapest: 'BUD',
      Warsaw: 'WAW',
      'Tel Aviv': 'TLV',
      Cairo: 'CAI',
      Johannesburg: 'JNB',
      'Cape Town': 'CPT',
      Nairobi: 'NBO',
      Casablanca: 'CAS',
      Marrakech: 'RAK',
      Doha: 'DOH',
      'Abu Dhabi': 'AUH',
      'Kuala Lumpur': 'KUL',
      Jakarta: 'JKT',
      Manila: 'MNL',
      'Ho Chi Minh City': 'SGN',
      Hanoi: 'HAN',
      Taipei: 'TPE',
      Melbourne: 'MEL',
      Brisbane: 'BNE',
      Perth: 'PER',
      Auckland: 'AKL',
    };

    const cityLower = (city || '').toLowerCase();
    for (const [name, code] of Object.entries(cityMap)) {
      const n = name.toLowerCase();
      if (cityLower.includes(n) || n.includes(cityLower)) return code;
    }
    return '';
  };

  const normalizeRating = (r) => {
    const n = Number(r);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(5, Math.round(n)));
  };

  const getHotelImageUrl = (hotel) => {
    // Check Google Places photos first
    if (hotel?.photos?.[0]) {
      return hotel.photos[0];
    }
    
    // Fallback to Amadeus media
    const m0 = hotel?.media?.[0];
    return (
      m0?.uri ||
      m0?.url ||
      m0?.links?.[0]?.href ||
      hotel?.images?.[0] ||
      null
    );
  };

  const perNight = (hotel) => {
    const total = Number(hotel?.offer?.price?.total);
    if (!Number.isFinite(total)) return null;
    return total / nights;
  };

  const formatAmenity = (amenity) => {
    if (!amenity) return '';
    return String(amenity)
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
  };

  const amenityIcon = (amenity) => {
    const map = {
      WIFI: <Wifi className="w-4 h-4" />,
      RESTAURANT: <UtensilsCrossed className="w-4 h-4" />,
      FITNESS_CENTER: <Dumbbell className="w-4 h-4" />,
      SWIMMING_POOL: <Coffee className="w-4 h-4" />,
    };
    return map[amenity] || null;
  };

  const searchHotels = async () => {
    setLoading(true);
    try {
      const cityCode = getCityCode(tripData.city);
      if (!cityCode) {
        alert(
          `I couldn't map "${tripData.city}" to an Amadeus city code. Try a major city name like "Paris" or "New York".`
        );
        setHotels([]);
        return;
      }

      const params = {
        cityCode,
        checkIn: tripData.checkIn,
        checkOut: tripData.checkOut,
        adults: tripData.travelers?.length || 1,
        rooms: Math.ceil((tripData.travelers?.length || 1) / 2),
      };

      // Rating filter
      if (filters.minRating > 0) {
        const ratings = [];
        for (let i = filters.minRating; i <= 5; i++) ratings.push(i);
        params.ratings = ratings.join(',');
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(',');
      }

      const response = await axios.get('/api/hotels/search', { params });
      const list = Array.isArray(response.data?.hotels) ? response.data.hotels : [];

      console.log("HOTELS raw count:", list.length);

      // Frontend per-night filter
      const filtered = list.filter((h) => {
        const pn = perNight(h);
        if (pn == null) return false;
        return pn <= filters.maxPricePerNight;
      });

      setHotels(filtered);
    } catch (err) {
      console.error('Hotel search error:', err);
      alert('Failed to search hotels. Check backend + Amadeus key.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for advanced search
  const handleAdvancedSearch = async (searchParams) => {
    setLoading(true);
    try {
      const params = {
        checkIn: tripData.checkIn,
        checkOut: tripData.checkOut,
        adults: tripData.travelers?.length || 1,
        rooms: Math.ceil((tripData.travelers?.length || 1) / 2),
      };

      // Use coordinates OR city code
      if (searchParams.latitude && searchParams.longitude) {
        params.latitude = searchParams.latitude;
        params.longitude = searchParams.longitude;
      } else {
        const cityCode = getCityCode(tripData.city);
        if (!cityCode) {
          alert(`Couldn't map "${tripData.city}" to a city code`);
          setLoading(false);
          return;
        }
        params.cityCode = cityCode;
      }

      // Add radius and multi-radius
      params.radius = searchParams.radius || 20;
      params.multiRadius = searchParams.multiRadius || false;

      // Add existing filters
      if (filters.minRating > 0) {
        const ratings = [];
        for (let i = filters.minRating; i <= 5; i++) ratings.push(i);
        params.ratings = ratings.join(',');
      }
      if (filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(',');
      }

      console.log('Searching with params:', params);

      const response = await axios.get('/api/hotels/search', { params });
      const list = Array.isArray(response.data?.hotels) ? response.data.hotels : [];

      console.log(`✓ Found ${list.length} hotels`);

      // Apply frontend price filter
      const filtered = list.filter((h) => {
        const pn = perNight(h);
        if (pn == null) return false;
        return pn <= filters.maxPricePerNight;
      });

      setHotels(filtered);
    } catch (err) {
      console.error('Hotel search error:', err);
      alert('Failed to search hotels');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (hotel) => {
    const id = hotel?.id;
    if (!id) return;

    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (detailsById[id]) return;

    try {
      const resp = await axios.get(`/api/hotels/${encodeURIComponent(id)}`);
      setDetailsById((prev) => ({ ...prev, [id]: resp.data }));
    } catch (e) {
      console.warn('Failed to load hotel details:', e);
      setDetailsById((prev) => ({ ...prev, [id]: { _error: true } }));
    }
  };

  const handleSelectHotel = (hotel) => setSelectedHotel(hotel);

  const handleContinue = () => {
    if (!selectedHotel) return;

    const hotelTotal = Number(selectedHotel?.offer?.price?.total) || 0;
    const flightTotal = Number(tripData?.totalFlightCost) || 0;

    navigate('/activities', {
      state: {
        ...tripData,
        selectedHotel,
        totalHotelCost: hotelTotal,
        totalCost: flightTotal + hotelTotal,
      },
    });
  };

  const renderStars = (ratingValue) => {
    const rating = normalizeRating(ratingValue);
    if (!rating) return null;

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
        <span className="text-sm text-gray-600 ml-2">{rating}★</span>
      </div>
    );
  };

  if (loading && hotels.length === 0) {
    return <LoadingSpinner message="Finding the best hotels..." />;
  }

  if (!tripData) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        title="Book Hotel"
        subtitle={`${tripData.city} • ${nights} nights • ${tripData.travelers?.length || 1} travelers`}
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
              <p className="font-medium text-gray-900">{tripData.travelers?.length || 1} people</p>
            </div>
          </div>
          {tripData.totalFlightCost != null && (
            <div className="mt-6 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Flights</span>
                <span className="font-medium text-purple-600">
                  {money(tripData.totalFlightCost, 'USD')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Hotel Search */}
        <AdvancedHotelFilters
          tripData={{
            ...tripData,
            cityCode: getCityCode(tripData.city)
          }}
          onSearch={handleAdvancedSearch}
          loading={loading}
        />

        {/* Additional Filters */}
        <div className="bg-white rounded-2xl p-8 mb-6 border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Additional Filters</h3>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-6">
              {/* Minimum Rating */}
              <div>
                <label className="block text-sm text-gray-700 mb-3">Minimum Rating</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilters((f) => ({ ...f, minRating: rating }))}
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

              {/* Max Price per Night */}
              <div>
                <label className="block text-sm text-gray-700 mb-3">
                  Max Price per Night:{' '}
                  <span className="text-purple-600 font-medium">
                    {money(filters.maxPricePerNight, 'USD')}
                  </span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={filters.maxPricePerNight}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, maxPricePerNight: parseInt(e.target.value, 10) }))
                  }
                  className="w-full h-1.5 bg-purple-50 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>$50</span>
                  <span>$1000+</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm text-gray-700 mb-3 font-medium">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['WIFI', 'RESTAURANT', 'FITNESS_CENTER', 'SWIMMING_POOL'].map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          setFilters((f) => {
                            if (e.target.checked) return { ...f, amenities: [...f.amenities, amenity] };
                            return { ...f, amenities: f.amenities.filter((a) => a !== amenity) };
                          });
                        }}
                        className="w-5 h-5 rounded text-purple-500 focus:ring-2 focus:ring-purple-400 border-gray-300"
                      />
                      <span className="text-sm font-medium">{formatAmenity(amenity)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAdvancedSearch({ radius: 20, multiRadius: false })}
                className="w-full py-3 rounded-lg bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40"
                disabled={loading}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading && hotels.length > 0 && (
          <div className="mb-6">
            <LoadingSpinner message="Updating hotel results..." />
          </div>
        )}

        {hotels.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{hotels.length} Hotels</h3>
                <p className="text-sm text-gray-600 mt-1">Prices shown are total + per-night</p>
              </div>
              {selectedHotel && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Hotel selected</span>
                </div>
              )}
            </div>

            {hotels.map((hotel) => {
              const total = Number(hotel?.offer?.price?.total);
              const currency = hotel?.offer?.price?.currency || 'USD';
              const pn = perNight(hotel);

              const img = getHotelImageUrl(hotel);
              const rating = normalizeRating(hotel?.rating);
              const address = hotel?.location?.address || '';
              const cityName = hotel?.location?.cityName || tripData.city || '';
              const amen = Array.isArray(hotel?.amenities) ? hotel.amenities : [];

              const isSelected = selectedHotel?.id === hotel.id;
              const isExpanded = expandedId === hotel.id;
              const details = detailsById[hotel.id];

              return (
                <div
                  key={hotel.id}
                  className={`bg-white border-2 rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                    isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-80 h-64 bg-stone-100">
                      {img ? (
                        <img
                          src={img}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center">
                          <HotelIcon className="w-16 h-16 text-purple-200" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div>
                          <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                            {hotel?.name || 'Unnamed Hotel'}
                          </h4>
                          {renderStars(rating)}
                        </div>

                        {isSelected && (
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
                          {[address, cityName].filter(Boolean).join(', ') || tripData.city}
                        </span>
                      </div>

                      {/* Google Places Details */}
                      {hotel.enriched ? (
                        <div className="space-y-4 mb-5">
                          {hotel.rating && hotel.reviewCount && (
                            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-gray-900 text-lg">{hotel.rating}</span>
                              <span className="text-sm text-gray-600">
                                ({hotel.reviewCount.toLocaleString()})
                              </span>
                              <span className="text-xs text-gray-500">Google</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            {hotel.phone && (
                              <a
                                href={`tel:${hotel.phone}`}
                                className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-lg">📞</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500">Call</p>
                                  <p className="text-sm text-purple-600 group-hover:text-purple-700 truncate">
                                    {hotel.phone}
                                  </p>
                                </div>
                              </a>
                            )}
                            
                            {hotel.website && (
                              <a
                                href={hotel.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-lg">🌐</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500">Website</p>
                                  <p className="text-sm text-purple-600 group-hover:text-purple-700">
                                    Visit site →
                                  </p>
                                </div>
                              </a>
                            )}
                          </div>

                          {hotel.reviews && hotel.reviews.length > 0 && (
                            (() => {
                              const review = hotel.reviews[0];
                              const isShort = review.text.length < 120;
                              
                              return isShort ? (
                                <div className="border-l-4 border-purple-400 bg-stone-50 rounded-r-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < review.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'fill-gray-200 text-gray-200'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-700 italic">
                                        "{review.text}"
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        — {review.author}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 italic">
                                  "{review.text.substring(0, 80)}..." 
                                  <span className="text-purple-600 ml-1">
                                    +{hotel.reviewCount.toLocaleString()} reviews
                                  </span>
                                </div>
                              );
                            })()
                          )}

                          {amen.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {amen.slice(0, 5).map((a, idx) => (
                                <span
                                  key={`${a}-${idx}`}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white border border-stone-200 text-gray-600 rounded-full"
                                >
                                  {amenityIcon(a)}
                                  {formatAmenity(a)}
                                </span>
                              ))}
                              {amen.length > 5 && (
                                <span className="text-xs text-gray-400 px-2 py-1">
                                  +{amen.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 mb-5">
                          {rating && rating > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < rating ? 'fill-gray-400 text-gray-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{rating}-star hotel</span>
                            </div>
                          ) : null}

                          {(() => {
                            const name = hotel?.name?.toLowerCase() || '';
                            const knownBrands = {
                              marriott: { emoji: '🏨', text: 'Part of Marriott International' },
                              hilton: { emoji: '🏨', text: 'Part of Hilton Hotels' },
                              hyatt: { emoji: '🏨', text: 'Part of Hyatt Hotels' },
                              intercontinental: { emoji: '🏨', text: 'Part of IHG Hotels' },
                              'holiday inn': { emoji: '🏨', text: 'Part of IHG Hotels' },
                              courtyard: { emoji: '🏨', text: 'Part of Marriott International' },
                            };

                            for (const [brand, info] of Object.entries(knownBrands)) {
                              if (name.includes(brand)) {
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-stone-50 rounded-lg px-3 py-2 border border-stone-200">
                                    <span>{info.emoji}</span>
                                    <span>{info.text}</span>
                                  </div>
                                );
                              }
                            }

                            return (
                              <div className="text-sm text-gray-600 bg-stone-50 rounded-lg px-3 py-2 border border-stone-200">
                                ℹ️ Contact hotel for full details and amenities
                              </div>
                            );
                          })()}

                          {amen.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {amen.slice(0, 6).map((a, idx) => (
                                <span
                                  key={`${a}-${idx}`}
                                  className="text-xs px-3 py-1.5 bg-white border border-stone-200 text-gray-700 rounded-full inline-flex items-center gap-1"
                                >
                                  {amenityIcon(a)}
                                  {formatAmenity(a)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4 gap-6">
                        <div>
                          <div className="text-4xl font-bold text-gray-900">
                            {Number.isFinite(total) ? money(total, currency) : '—'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {pn != null ? (
                              <>
                                <span className="font-medium text-gray-900">{money(pn, currency)}</span> per night ·{' '}
                                {nights} nights
                              </>
                            ) : (
                              'Price not available for these dates.'
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 min-w-[220px]">
                          <button
                            onClick={() => handleSelectHotel(hotel)}
                            disabled={!Number.isFinite(total)}
                            className={`w-full px-8 py-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              isSelected
                                ? 'bg-purple-600 text-white border-2 border-purple-600'
                                : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select Hotel'}
                          </button>
                

                          <div className="flex gap-2">
                            <a
                              href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
                                tripData.city
                              )}&checkin=${tripData.checkIn}&checkout=${tripData.checkOut}&group_adults=${
                                tripData.travelers?.length || 1
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-white border border-purple-600 text-purple-600 text-xs rounded-lg hover:bg-purple-50 transition-all text-center"
                            >
                              Booking.com
                            </a>
                            <a
                              href={`https://www.hotels.com/search.do?destination=${encodeURIComponent(
                                tripData.city
                              )}&startDate=${tripData.checkIn}&endDate=${tripData.checkOut}&rooms=1`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-white border border-purple-600 text-purple-600 text-xs rounded-lg hover:bg-purple-50 transition-all text-center"
                            >
                              Hotels.com
                            </a>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {details && !details._error ? (
                            <HotelDetailsBlock details={details} />
                          ) : details && details._error ? (
                            <p className="text-sm text-gray-500">
                              Couldn't load extra details from the details endpoint.
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Loading details…</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-purple-100 p-16 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <HotelIcon className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-6">
              Try widening filters (higher max price per night or lower rating).
            </p>
            <button
              onClick={() => handleAdvancedSearch({ radius: 20, multiRadius: false })}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Search Again
            </button>
          </div>
        ) : null}

        {/* Continue */}
        {selectedHotel && (
          <div className="sticky bottom-6 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-purple-200 p-8 shadow-2xl mt-10">
            <div className="flex items-center justify-between gap-6 flex-col md:flex-row">
              <div>
                <p className="text-xl font-medium text-gray-900 mb-3">{selectedHotel.name}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Flights</span>
                    <span className="font-medium text-gray-900">
                      {money(Number(tripData?.totalFlightCost) || 0, 'USD')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Hotel ({nights} nights)</span>
                    <span className="font-medium text-gray-900">
                      {money(Number(selectedHotel?.offer?.price?.total) || 0, selectedHotel?.offer?.price?.currency || 'USD')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-purple-600 mb-1 uppercase tracking-wide">Total</p>
                <p className="text-4xl font-medium text-gray-900 mb-4">
                  {money((Number(tripData?.totalFlightCost) || 0) + (Number(selectedHotel?.offer?.price?.total) || 0), 'USD')}
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

function HotelDetailsBlock({ details }) {
  const data = details?.data || details;
  const hotel = data?.hotel || data?.data?.hotel || null;
  const offers = data?.offers || data?.data?.offers || [];

  const text = hotel?.description?.text || hotel?.description || '';
  const amenities = hotel?.amenities || [];

  return (
    <div className="space-y-3">
      {text ? (
        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      ) : (
        <p className="text-sm text-gray-500">No description available.</p>
      )}

      {Array.isArray(amenities) && amenities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {amenities.slice(0, 10).map((a, idx) => (
            <span
              key={`${a}-${idx}`}
              className="text-xs px-3 py-1.5 bg-stone-100 text-gray-700 rounded-full font-medium"
            >
              {String(a).replace(/_/g, ' ').toLowerCase()}
            </span>
          ))}
          {amenities.length > 10 && (
            <span className="text-xs text-gray-500 px-3 py-1.5">+{amenities.length - 10} more</span>
          )}
        </div>
      )}

      {Array.isArray(offers) && offers.length > 0 && (
        <div className="text-xs text-gray-500">
          Offers available: <span className="text-gray-700 font-medium">{offers.length}</span>
        </div>
      )}
    </div>
  );
}