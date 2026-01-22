// AirportAutocomplete.jsx - FIXED VERSION
// Handles different API response structures

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plane, X } from 'lucide-react';

export default function AirportAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Select City or Airport",
  label = ""
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAirports = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/flights/airports', {
        params: {
          keyword,
          subType: 'AIRPORT,CITY'
        }
      });

      console.log('Airport search response:', response.data); // DEBUG
      setSuggestions(response.data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Airport search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAirports(newValue);
    }, 300);
  };

  const handleSelect = (airport) => {
    console.log('Selected airport object:', airport); // DEBUG
    
    // Handle different possible property structures from API
    const code = airport.iataCode || airport.code || '';
    const city = airport.cityName || airport.city || airport.address?.cityName || '';
    const country = airport.countryName || airport.country || airport.address?.countryName || '';
    const name = airport.name || '';
    
    // Create display text
    const displayText = city && country 
      ? `${city}, ${country}`
      : name || code;

    console.log('Display text:', displayText); // DEBUG

    setInputValue(displayText);
    setIsOpen(false);
    setSuggestions([]);

    onChange({
      code: code,
      city: city,
      country: country,
      name: name,
      displayText: displayText
    });
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    onChange({
      code: '',
      city: '',
      country: '',
      displayText: ''
    });
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-xs text-gray-600 mb-1">{label}</label>
      )}
      
      <div className="relative">
        <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 h-10 text-sm border border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
          autoComplete="off"
        />
        
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((airport, index) => {
            // Handle different property structures in display
            const code = airport.iataCode || airport.code || '';
            const city = airport.cityName || airport.city || airport.address?.cityName || '';
            const country = airport.countryName || airport.country || airport.address?.countryName || '';
            const name = airport.name || '';
            const subType = airport.subType || 'AIRPORT';
            
            return (
              <button
                key={airport.id || index}
                type="button"
                onClick={() => handleSelect(airport)}
                className={`w-full text-left px-3 py-2 hover:bg-purple-50 transition-colors ${
                  index === selectedIndex ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <Plane className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-gray-900 text-sm">
                        {code}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        subType === 'AIRPORT' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {subType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {city && country ? `${city}, ${country}` : city || country || 'Location'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && !loading && suggestions.length === 0 && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">No airports found</p>
        </div>
      )}
    </div>
  );
}