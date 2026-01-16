#!/bin/bash

echo "🚀 Travel Planner Frontend - Quick Start"
echo "========================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎨 Starting development server..."
echo "   Frontend: http://localhost:3000"
echo "   Make sure backend is running on http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
