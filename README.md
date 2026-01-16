# Travel Planner Frontend 🌍✈️

React + Vite frontend for the Travel Planner application.

## Features

- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔀 Mix-and-match itinerary builder
- 📱 Mobile-friendly design
- ⚡ Fast development with Vite HMR
- 🎯 Smart form validation
- 💾 Export itineraries

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Mapbox GL** - Maps & geocoding

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx      # Navigation bar
│   ├── LoadingSpinner.jsx
│   ├── DayCard.jsx     # Individual day display
│   └── DraftCard.jsx   # Full draft display
├── pages/              # Route pages
│   ├── Home.jsx        # Search form
│   └── Results.jsx     # Itinerary results
├── utils/              # Utilities
│   ├── api.js          # API client
│   └── constants.js    # App constants
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on port 3001

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment (optional)**
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Start development server**
```bash
npm run dev
```

4. **Open browser**
```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Component Overview

### Pages

**Home** (`src/pages/Home.jsx`)
- Search form with city, dates, budget, group size
- Travel style slider (Frugal ↔ Splurge)
- Interest preferences (foodie, museums, etc.)
- Form validation and submission

**Results** (`src/pages/Results.jsx`)
- Displays 3 generated itinerary drafts
- Mix-and-match day selection
- Real-time cost tracking
- Export functionality
- Budget status indicator

### Components

**Navbar** (`src/components/Navbar.jsx`)
- App navigation with back button
- Title and subtitle display
- Sticky header

**LoadingSpinner** (`src/components/LoadingSpinner.jsx`)
- Loading state with animation
- Customizable message

**DayCard** (`src/components/DayCard.jsx`)
- Individual day itinerary display
- Time-of-day icons (morning/afternoon/evening)
- Activity list with descriptions
- Selection button

**DraftCard** (`src/components/DraftCard.jsx`)
- Full draft container
- Strategy header with gradient
- Cost and duration summary
- Multiple DayCards

### Utils

**api.js** (`src/utils/api.js`)
- Axios instance configuration
- API endpoint functions:
  - `geocodeCity(city)` - Convert city to coordinates
  - `generateItinerary(params)` - Generate full itinerary
  - `getActivities(lat, lng)` - Fetch activities
  - `getPlaces(lat, lng, type)` - Fetch restaurants/POIs
  - `getRoute(coords)` - Calculate walking routes

**constants.js** (`src/utils/constants.js`)
- Preference options
- Travel styles
- Budget ranges
- Time of day constants

## API Integration

The frontend communicates with the backend through these endpoints:

```javascript
GET  /api/geocode?city=Paris
POST /api/itinerary/generate
GET  /api/activities?lat=48.8566&lng=2.3522
GET  /api/places?lat=48.8566&lng=2.3522&type=food
GET  /api/route?coords=2.3522,48.8566;2.2945,48.8584
```

## Styling

The app uses Tailwind CSS with custom utility classes:

- `.btn-primary` - Primary action button with gradient
- `.btn-secondary` - Secondary button
- `.card` - Standard card container
- `.input-field` - Form input styling

Custom theme colors:
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)

## State Management

Uses React hooks for state:
- `useState` - Component state
- `useEffect` - Side effects (API calls)
- `useNavigate` - Programmatic navigation
- `sessionStorage` - Persist search params between pages

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in `dist/`.

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables (if needed)
4. Deploy

### Deploy to Netlify

1. Run `npm run build`
2. Drag `dist/` folder to Netlify
3. Configure redirects for SPA routing

Add `_redirects` file in `public/`:
```
/*  /index.html  200
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `/api` for proxy)

In production, set this to your backend URL:
```
VITE_API_URL=https://your-backend.com/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Module Replacement**: Changes auto-reload in dev
2. **React DevTools**: Install browser extension for debugging
3. **Network Tab**: Monitor API calls in browser DevTools
4. **Component Props**: Use React DevTools to inspect props

## Troubleshooting

**"Cannot connect to backend"**
- Ensure backend is running on port 3001
- Check Vite proxy configuration
- Verify API_URL in .env

**"Build fails"**
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for TypeScript errors

**"Styles not loading"**
- Ensure Tailwind directives in index.css
- Check PostCSS configuration
- Rebuild CSS: `npm run build`

## Future Enhancements

- [ ] Interactive map view with Mapbox
- [ ] Save itineraries to local storage
- [ ] Share itineraries via link
- [ ] Print-friendly itinerary view
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Credits

Built with ❤️ using:
- React
- Vite
- Tailwind CSS
- Lucide Icons
