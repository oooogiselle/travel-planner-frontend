import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">{message}</p>
        <p className="text-gray-500 text-sm mt-2">This may take a few seconds...</p>
      </div>
    </div>
  );
}
