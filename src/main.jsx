// src/main.jsx - WITH DASHBOARD!
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TripDetails from './pages/TripDetails';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Activities from './pages/Activities';
import Summary from './pages/Summary';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trip/:tripId" 
            element={
              <ProtectedRoute>
                <TripDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/flights" 
            element={
              <ProtectedRoute>
                <Flights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hotels" 
            element={
              <ProtectedRoute>
                <Hotels />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/activities" 
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/summary" 
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);