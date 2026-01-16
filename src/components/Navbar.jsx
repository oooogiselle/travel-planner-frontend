import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function Navbar({ title, subtitle, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Back button or logo */}
          {showBack ? (
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Home className="w-6 h-6 mr-2" />
              <span className="text-xl font-bold">Travel Planner</span>
            </button>
          )}

          {/* Center - Title */}
          {title && (
            <div className="flex-1 text-center px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          )}

          {/* Right side - Spacer for centering */}
          <div className="w-20"></div>
        </div>
      </div>
    </header>
  );
}
