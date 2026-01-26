// src/pages/TripDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plane,
  Hotel as HotelIcon,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Edit2,
  Plus,
  Trash2,
  Check,
  X,
  Download,
  Share2,
  Save,
  Loader,
  ArrowLeft,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getTrip, updateTrip, deleteTrip } from '../firebase/firestore';

export default function TripDetails() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { currentUser } = useAuth();

  const [tripData, setTripData] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    if (!tripId) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    const result = await getTrip(tripId);

    if (result.success) {
      setTripData(result.trip);
      if (result.trip.itinerary) {
        setItinerary(result.trip.itinerary);
      }
    } else {
      alert('Could not load trip. Please try again.');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
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

  const nights = tripData?.checkOut && tripData?.checkIn
    ? Math.ceil((new Date(tripData.checkOut) - new Date(tripData.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  // Editable itinerary functions
  const handleEditActivity = (dayIndex, activityIndex) => {
    const activity = itinerary.days[dayIndex].activities[activityIndex];
    setEditingActivity({
      dayIndex,
      activityIndex,
      ...activity,
    });
  };

  const handleSaveActivity = () => {
    if (!editingActivity) return;

    const newItinerary = { ...itinerary };
    newItinerary.days[editingActivity.dayIndex].activities[editingActivity.activityIndex] = {
      time: editingActivity.time,
      name: editingActivity.name,
      type: editingActivity.type,
    };

    setItinerary(newItinerary);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (dayIndex, activityIndex) => {
    const newItinerary = { ...itinerary };
    newItinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };

  const handleAddActivity = (dayIndex) => {
    const newItinerary = { ...itinerary };
    newItinerary.days[dayIndex].activities.push({
      time: '12:00 PM',
      name: 'New activity',
      type: 'activity',
    });
    setItinerary(newItinerary);

    // Auto-edit the new activity
    const newActivityIndex = newItinerary.days[dayIndex].activities.length - 1;
    handleEditActivity(dayIndex, newActivityIndex);
  };

  const handleUpdateTrip = async () => {
    if (!currentUser || !tripId) return;

    setIsSaving(true);

    try {
      const updates = {
        itinerary: itinerary,
        // You could add other editable fields here
      };

      const result = await updateTrip(tripId, updates);

      if (result.success) {
        alert('Trip updated successfully! ✅');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      const result = await deleteTrip(tripId);

      if (result.success) {
        alert('Trip deleted successfully!');
        navigate('/dashboard');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = () => {
    if (!tripData) return;
    const city = tripData.destination || tripData.city;
    const shareText = `Check out my trip to ${city}!\n\nDates: ${formatDate(tripData.checkIn)} - ${formatDate(tripData.checkOut)}\nTotal: ${money(tripData.totalCost)}`;

    if (navigator.share) {
      navigator.share({
        title: `Trip to ${city}`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Trip details copied to clipboard! 📋');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!tripData) return null;

  const totalCost = tripData.totalCost || 0;
  const flightCost = tripData.totalFlightCost || 0;
  const hotelCost = tripData.totalHotelCost || 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar
        title={`${tripData.destination || tripData.city} Trip`}
        subtitle={`${nights} nights`}
        showBack
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">Your Trip to {tripData.destination || tripData.city}</h1>
          </div>
          <div className="flex items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(tripData.checkIn)} - {formatDate(tripData.checkOut)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{tripData.travelers?.length || 1} travelers</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xl font-bold">{money(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={handleUpdateTrip}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDeleteTrip}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete Trip
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flights */}
            {tripData.selectedOutboundFlight ? (
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Flights</h2>
                    <p className="text-sm text-gray-600">Outbound & Return</p>
                  </div>
                </div>

                {/* Outbound */}
                <FlightCard
                  flight={tripData.selectedOutboundFlight}
                  label="Outbound"
                />

                {/* Return */}
                {tripData.selectedReturnFlight && (
                  <FlightCard
                    flight={tripData.selectedReturnFlight}
                    label="Return"
                    className="mt-4"
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">No Flights Data</h2>
                    <p className="text-sm text-gray-600">This trip was saved without flight information</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel */}
            {tripData.selectedHotel ? (
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <HotelIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Accommodation</h2>
                    <p className="text-sm text-gray-600">{nights} nights</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {tripData.selectedHotel.photos?.[0] && (
                    <img
                      src={tripData.selectedHotel.photos[0]}
                      alt={tripData.selectedHotel.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tripData.selectedHotel.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {tripData.selectedHotel.location?.address || tripData.destination || tripData.city}
                      </span>
                    </div>
                    {tripData.selectedHotel.rating && (
                      <div className="text-sm text-gray-600 mb-3">
                        ⭐ {tripData.selectedHotel.rating}
                        {tripData.selectedHotel.reviewCount && (
                          <span className="ml-1">({tripData.selectedHotel.reviewCount})</span>
                        )}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {money(hotelCost)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {money(hotelCost / nights)}/night
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <HotelIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">No Hotel Data</h2>
                    <p className="text-sm text-gray-600">This trip was saved without hotel information</p>
                  </div>
                </div>
              </div>
            )}

            {/* Editable Itinerary - Same as Summary page */}
            {itinerary && itinerary.days && itinerary.days.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Your Itinerary</h2>
                      <p className="text-sm text-gray-600">{itinerary.title}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Click to edit ✏️
                  </span>
                </div>

                <div className="space-y-6">
                  {itinerary.days?.map((day, dayIndex) => (
                    <div key={dayIndex} className="border-l-4 border-purple-400 pl-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Day {day.day}
                        </h3>
                        <button
                          onClick={() => handleAddActivity(dayIndex)}
                          className="text-xs flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Activity
                        </button>
                      </div>

                      <div className="space-y-3">
                        {day.activities.map((activity, activityIndex) => (
                          <div
                            key={activityIndex}
                            className="group relative bg-stone-50 rounded-lg p-4 hover:bg-stone-100 transition-all"
                          >
                            {editingActivity?.dayIndex === dayIndex &&
                            editingActivity?.activityIndex === activityIndex ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <div className="flex gap-3">
                                  <input
                                    type="text"
                                    value={editingActivity.time}
                                    onChange={(e) =>
                                      setEditingActivity({ ...editingActivity, time: e.target.value })
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-24"
                                    placeholder="9:00 AM"
                                  />
                                  <input
                                    type="text"
                                    value={editingActivity.name}
                                    onChange={(e) =>
                                      setEditingActivity({ ...editingActivity, name: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Activity name"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <select
                                    value={editingActivity.type}
                                    onChange={(e) =>
                                      setEditingActivity({ ...editingActivity, type: e.target.value })
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="attraction">Attraction</option>
                                    <option value="food">Food</option>
                                    <option value="activity">Activity</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="nature">Nature</option>
                                    <option value="museum">Museum</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="wellness">Wellness</option>
                                  </select>
                                  <button
                                    onClick={handleSaveActivity}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingActivity(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <>
                                <div className="flex items-start gap-4">
                                  <span className="text-sm font-medium text-purple-600 min-w-[70px]">
                                    {activity.time}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-gray-900 font-medium">{activity.name}</p>
                                    <p className="text-xs text-gray-500 capitalize mt-1">
                                      {activity.type.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                  <button
                                    onClick={() => handleEditActivity(dayIndex, activityIndex)}
                                    className="p-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                                    className="p-2 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">No Itinerary Yet</h2>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    This trip was saved before itinerary data was available. To see flights, hotel, and activities:
                  </p>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Plan a new trip with the AI</li>
                    <li>Go through flights, hotel, and activities pages</li>
                    <li>Save the complete trip</li>
                  </ol>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Plan New Trip →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Cost Breakdown */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown</h3>

              <div className="space-y-4 mb-6">
                {flightCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flights</span>
                    <span className="font-medium text-gray-900">{money(flightCost)}</span>
                  </div>
                )}
                {hotelCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hotel ({nights} nights)</span>
                    <span className="font-medium text-gray-900">{money(hotelCost)}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-purple-600">{money(totalCost)}</span>
                </div>

                <button
                  onClick={handleUpdateTrip}
                  disabled={isSaving}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-3 py-3 bg-white border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-xs text-gray-500 text-center">
                  Prices are estimates. Final prices may vary at booking.
                </p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Destination</p>
                  <p className="font-medium text-gray-900">{tripData.destination || tripData.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{nights} nights</p>
                </div>
                <div>
                  <p className="text-gray-500">Travelers</p>
                  <p className="font-medium text-gray-900">
                    {tripData.travelers?.length || 1} {tripData.travelers?.length === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FlightCard({ flight, label, className = '' }) {
  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const segment = flight?.itineraries?.[0]?.segments?.[0];
  if (!segment) return null;

  return (
    <div className={`border border-stone-200 rounded-xl p-4 ${className}`}>
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{label}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{segment.departure.iataCode}</p>
          <p className="text-sm text-gray-600">{formatTime(segment.departure.at)}</p>
        </div>
        <div className="flex-1 mx-4">
          <div className="border-t-2 border-gray-300 relative">
            <Plane className="w-4 h-4 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            {segment.carrierCode} {segment.number}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{segment.arrival.iataCode}</p>
          <p className="text-sm text-gray-600">{formatTime(segment.arrival.at)}</p>
        </div>
      </div>
    </div>
  );
}