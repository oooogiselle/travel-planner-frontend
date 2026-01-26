# Travel Planner Application

A full-stack travel planning application with AI-powered itinerary generation, flight and hotel search, and trip management features.

## Architecture

### Frontend
- **Framework:** React with Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect, useContext)
- **Authentication:** Firebase Authentication
- **Database:** Firebase Firestore
- **HTTP Client:** Axios
- **Deployment:** Render

### Backend
- **Framework:** Express.js
- **AI:** Google Gemini (gemini-2.5-flash)
- **APIs:** Amadeus (Flights), Foursquare (Hotels), OpenCage (Geocoding)
- **Caching:** node-cache
- **CORS:** cors middleware
- **Deployment:** Render

## Features

### 1. AI-Powered Trip Planning
- Natural language trip query parsing
- Destination, dates, travelers, and budget extraction
- Intelligent defaults for missing information

### 2. Flight Search
- Airport search with autocomplete
- Multi-city and date range support
- Real-time flight availability through Amadeus API
- Price comparison and filtering

### 3. Hotel Search
- Location-based hotel search
- Filtering by price, rating, amenities
- Integration with Foursquare Places API
- Hotel details with photos and reviews

### 4. AI Itinerary Generation
- Three distinct itinerary styles: Cultural, Modern, Relaxed
- Conversational refinement through chat interface
- Custom itinerary generation based on preferences
- Day-by-day activity planning with times and types

### 5. Trip Management
- Save complete trips to Firebase Firestore
- View all saved trips in dashboard
- Edit itineraries with inline editing
- Add/remove/modify activities per day
- Delete trips with confirmation

### 6. User Authentication
- Email/password authentication via Firebase
- Protected routes requiring login
- User-specific trip data

## Project Structure

### Frontend Structure
```
travel-planner-frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx           # Navigation component
│   ├── config/
│   │   └── api.js               # API configuration
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── firebase/
│   │   ├── config.js            # Firebase configuration
│   │   └── firestore.js         # Firestore operations
│   ├── pages/
│   │   ├── Home.jsx             # Landing page with AI trip parser
│   │   ├── Login.jsx            # Login page
│   │   ├── Signup.jsx           # Signup page
│   │   ├── Dashboard.jsx        # Saved trips dashboard
│   │   ├── Flights.jsx          # Flight search page
│   │   ├── Hotels.jsx           # Hotel search page
│   │   ├── Activities.jsx       # AI itinerary generation
│   │   ├── Summary.jsx          # Trip summary and save
│   │   └── TripDetails.jsx      # View/edit saved trip
│   ├── main.jsx                 # App entry point with routing
│   └── index.css                # Global styles
├── .env                         # Environment variables
└── package.json
```

### Backend Structure
```
travel-planner-backend/
├── routes/
│   ├── activities.js            # Itinerary generation & chat
│   ├── parse-trip.js            # AI trip query parser
│   ├── flights.js               # Flight search via Amadeus
│   ├── hotels.js                # Hotel search via Foursquare
│   ├── geocode.js               # Geocoding via OpenCage
│   ├── places.js                # Places search
│   └── itinerary.js             # Itinerary helpers
├── middleware/
│   ├── errorHandler.js          # Global error handler
│   └── requestLogger.js         # Request logging
├── server.js                    # Express server setup
├── .env                         # Environment variables
└── package.json
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Gemini API key
- Amadeus API credentials
- Foursquare API key

### Frontend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd travel-planner-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
VITE_API_URL=https://your-backend-url.onrender.com

# Firebase configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Start development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

### Backend Setup

1. Navigate to backend directory
```bash
cd travel-planner-backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
PORT=3001
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend-url.onrender.com

# AI
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Flight API (Amadeus)
AMADEUS_API_KEY=your-amadeus-key
AMADEUS_API_SECRET=your-amadeus-secret

# Hotel API (Foursquare)
FOURSQUARE_API_KEY=your-foursquare-key

# Geocoding
OPENCAGE_API_KEY=your-opencage-key
```

4. Start development server
```bash
npm run dev
```

5. Start production server
```bash
npm start
```

## Deployment

### Frontend Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`
   - Environment Variables: Add all VITE_ variables

### Backend Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add all backend variables including ALLOWED_ORIGINS

## Environment Variables

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | `https://api.example.com` |
| VITE_FIREBASE_API_KEY | Firebase API key | `AIza...` |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase auth domain | `app.firebaseapp.com` |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID | `my-project` |
| VITE_FIREBASE_STORAGE_BUCKET | Firebase storage bucket | `my-project.appspot.com` |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID | `123456789` |
| VITE_FIREBASE_APP_ID | Firebase app ID | `1:123:web:abc` |

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | `3001` |
| ALLOWED_ORIGINS | Allowed frontend URLs (comma-separated) | `https://app.com,http://localhost:5173` |
| GOOGLE_GEMINI_API_KEY | Google Gemini API key | `AIza...` |
| AMADEUS_API_KEY | Amadeus API key | `abc123...` |
| AMADEUS_API_SECRET | Amadeus API secret | `xyz789...` |
| FOURSQUARE_API_KEY | Foursquare API key | `fsq3...` |
| OPENCAGE_API_KEY | OpenCage API key | `abc123...` |

## API Endpoints

### AI Endpoints
- `POST /api/ai/parse-trip` - Parse natural language trip query

### Activities Endpoints
- `POST /api/activities/generate-itineraries` - Generate 3 itinerary options
- `POST /api/activities/chat` - Conversational itinerary refinement

### Flight Endpoints
- `GET /api/flights/search` - Search for flights
- `GET /api/flights/airports` - Search airports by keyword

### Hotel Endpoints
- `GET /api/hotels/search` - Search hotels by location
- `GET /api/hotels/search-by-location` - Search hotels by coordinates
- `GET /api/hotels/:hotelId` - Get hotel details

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/geocode` - Geocode city names
- `GET /api/cache/clear` - Clear cache (debug)
- `GET /api/cache/stats` - View cache statistics (debug)

## Firebase Firestore Schema

### Trips Collection
```javascript
{
  // Trip metadata
  ownerId: string,              // User ID who created trip
  tripName: string,             // Auto-generated trip name
  destination: string,          // City name
  checkIn: string,              // ISO date string
  checkOut: string,             // ISO date string
  
  // Travelers
  travelers: [
    {
      name: string,
      age: number,
      passportNumber: string
    }
  ],
  
  // Budget
  budgetPerPerson: number,
  
  // Preferences
  style: string,                // 'budget' | 'balanced' | 'luxury'
  preferences: string[],        // ['cultural', 'food', etc.]
  
  // Selected options
  selectedOutboundFlight: {
    airline: string,
    flightNumber: string,
    departure: {
      airport: string,
      time: string
    },
    arrival: {
      airport: string,
      time: string
    },
    duration: string,
    price: number,
    stops: number
  },
  
  selectedReturnFlight: {...},  // Same structure as outbound
  
  selectedHotel: {
    id: string,
    name: string,
    location: {
      address: string,
      latitude: number,
      longitude: number
    },
    rating: number,
    reviewCount: number,
    pricePerNight: number,
    photos: string[],
    amenities: string[]
  },
  
  // AI-generated itinerary
  itinerary: {
    title: string,
    days: [
      {
        day: number,
        activities: [
          {
            time: string,        // '9:00 AM'
            name: string,
            type: string         // 'attraction' | 'food' | 'cultural' | etc.
          }
        ]
      }
    ]
  },
  
  // Costs
  totalCost: number,
  totalFlightCost: number,
  totalHotelCost: number,
  
  // Sharing (future feature)
  sharedWith: string[],         // User IDs
  isPublic: boolean,
  
  // Status
  status: string,               // 'planning' | 'booked' | 'completed'
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Key Features Implementation

### 1. Trip Saving Flow
1. User plans trip through AI conversation
2. Selects flights on Flights page
3. Selects hotel on Hotels page
4. AI generates itinerary on Activities page
5. Reviews everything on Summary page
6. Clicks "Save Trip" - saves to Firestore
7. Redirected to Dashboard showing all saved trips

### 2. Trip Editing Flow
1. User clicks "View & Edit" on Dashboard
2. Opens TripDetails page with full trip info
3. Can edit itinerary inline:
   - Hover over activity to see Edit/Delete buttons
   - Click Edit to modify time, name, or type
   - Click Add Activity to insert new activities
   - All changes saved when "Save Changes" clicked

### 3. AI Itinerary Generation
1. Backend prompts Gemini with trip context
2. Gemini returns 3 distinct itineraries (Cultural, Modern, Relaxed)
3. User can chat to refine: "make it more food focused"
4. Backend prompts Gemini to generate custom itinerary as JSON
5. Frontend parses JSON and shows "Use This Itinerary" button
6. User confirms and continues to Summary

## Common Issues and Solutions

### Issue: CORS Errors
**Solution:** Add frontend URL to `ALLOWED_ORIGINS` in backend environment variables

### Issue: API calls going to localhost in production
**Solution:** Ensure `VITE_API_URL` is set in frontend deployment environment variables

### Issue: Firestore index errors
**Solution:** Click the link in the error message to create required index, or sort in JavaScript instead

### Issue: Old trips missing flight/hotel/itinerary data
**Solution:** These trips were saved before the feature was added. Create new trips to get full data.

### Issue: "Use This Itinerary" button not appearing
**Solution:** Backend must return `generatedItinerary` in `/api/activities/chat` response

### Issue: Double slash in API URLs
**Solution:** Remove trailing slash from `VITE_API_URL` in .env file

## Development Workflow

### Local Development
1. Start backend: `cd travel-planner-backend && npm run dev`
2. Start frontend: `cd travel-planner-frontend && npm run dev`
3. Backend runs on http://localhost:3001
4. Frontend runs on http://localhost:5173

### Testing Production Build Locally
```bash
# Frontend
npm run build
npm run preview

# Backend
NODE_ENV=production npm start
```

## Technology Stack

### Frontend
- React 18
- React Router 6
- Tailwind CSS 3
- Vite 5
- Axios
- Lucide React (icons)
- Firebase SDK

### Backend
- Express 4
- Google Generative AI (Gemini)
- Amadeus SDK
- Axios
- CORS
- Node Cache
- dotenv

## File Updates Reference

### Files Created/Updated in This Session

**Frontend:**
- `src/config/api.js` - Central API configuration
- `src/pages/Activities.jsx` - Added generatedItinerary support, fixed banner layout
- `src/pages/TripDetails.jsx` - View/edit saved trips
- `src/pages/Dashboard.jsx` - View all saved trips
- `src/pages/Summary.jsx` - Save trips to Firebase
- `src/firebase/firestore.js` - Firestore operations (save, get, update, delete trips)
- `src/main.jsx` - Added TripDetails route

**Backend:**
- `routes/activities.js` - Updated chat function to return generatedItinerary
- `routes/parse-trip.js` - AI-powered natural language trip parser
- `server.js` - Added parse-trip route, configured CORS

**Documentation:**
- Complete guides for all features
- Troubleshooting documentation
- Setup instructions

## Future Enhancements

### Planned Features
- Share trips with friends
- Collaborative trip planning
- Trip status tracking (planning, booked, completed)
- Add notes to activities
- Upload photos to trips
- Export trips to PDF
- Budget breakdown by category
- Weather information integration
- Currency conversion
- Multi-language support

### Technical Improvements
- Implement caching for Firebase reads
- Add pagination to Dashboard
- Optimize bundle size
- Add service worker for offline support
- Implement optimistic UI updates
- Add comprehensive error boundaries
- Implement retry logic for failed API calls

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.

## Contributors

Giselle