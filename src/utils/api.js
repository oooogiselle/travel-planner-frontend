import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Geocode a city to get coordinates
export const geocodeCity = async (city) => {
  const response = await api.get('/geocode', { params: { city } });
  return response.data;
};

// Get activities from Amadeus
export const getActivities = async (lat, lng, radius = 20) => {
  const response = await api.get('/activities', {
    params: { lat, lng, radius },
  });
  return response.data;
};

// Get places (restaurants/POIs) from Foursquare
export const getPlaces = async (lat, lng, type, price, categories, limit = 50) => {
  const response = await api.get('/places', {
    params: { lat, lng, type, price, categories, limit },
  });
  return response.data;
};

// Generate complete itinerary
export const generateItinerary = async (params) => {
  const response = await api.post('/itinerary/generate', params);
  return response.data;
};

// Get route between coordinates
export const getRoute = async (coords) => {
  const response = await api.get('/route', { params: { coords } });
  return response.data;
};

export default api;
