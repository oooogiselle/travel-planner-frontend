// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../firebase/auth';
import { getUserTrips } from '../firebase/firestore';
import { Sparkles, MapPin, Calendar, Users, DollarSign, Plus, Loader, Eye } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [currentUser]);

  const loadTrips = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    const result = await getUserTrips(currentUser.uid);
    
    if (result.success) {
      setTrips(result.trips);
    } else {
      console.error('Error loading trips:', result.error);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    const result = await logOut();
    if (result.success) {
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">TripPlan</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Traveler'}! 👋
          </h1>
          <p className="text-gray-600">Ready to plan your next adventure?</p>
        </div>

        {/* New Trip Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Plan New Trip
        </button>

        {/* Trips Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Trips {trips.length > 0 && `(${trips.length})`}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Plan Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Trip Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {trip.tripName || `${trip.destination} Trip`}
                    </h3>
                    <div className="flex items-center gap-2 text-purple-100 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.destination}</span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(trip.checkIn)} - {formatDate(trip.checkOut)}
                        {trip.checkIn && trip.checkOut && (
                          <span className="text-gray-400 ml-1">
                            ({calculateNights(trip.checkIn, trip.checkOut)} nights)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {trip.travelers?.length || 0} {trip.travelers?.length === 1 ? 'traveler' : 'travelers'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>${trip.budgetPerPerson}/person</span>
                    </div>

                    {trip.preferences && trip.preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {trip.preferences.slice(0, 3).map((pref, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
                          >
                            {pref}
                          </span>
                        ))}
                        {trip.preferences.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{trip.preferences.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                        trip.status === 'booked' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status || 'planning'}
                      </span>

                      <button
                        onClick={() => navigate(`/trip/${trip.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View & Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}