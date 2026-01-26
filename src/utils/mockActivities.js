// utils/mockActivities.js
// Mock activity data generator - Replace with real API later

const CITY_ACTIVITIES = {
  Paris: [
    {
      id: 'paris_1',
      name: 'Eiffel Tower Skip-the-Line Ticket',
      type: 'attraction',
      description: 'Visit the iconic Eiffel Tower with priority access. Enjoy panoramic views of Paris from the summit.',
      duration: '2 hours',
      location: 'Champ de Mars, 7th arrondissement',
      groupSize: 'Up to 30 people',
      pricePerPerson: 45,
      rating: 4.8,
      reviews: 12543,
      provider: 'GetYourGuide',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
      bookingUrl: '#',
      highlights: ['Skip the line', 'Summit access', 'Audio guide included']
    },
    {
      id: 'paris_2',
      name: 'Louvre Museum Guided Tour',
      type: 'culture',
      description: 'Discover the world\'s largest art museum with an expert guide. See the Mona Lisa, Venus de Milo, and more.',
      duration: '3 hours',
      location: 'Rue de Rivoli',
      groupSize: 'Small group (15 max)',
      pricePerPerson: 65,
      rating: 4.9,
      reviews: 8921,
      provider: 'Viator',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      bookingUrl: '#'
    },
    {
      id: 'paris_3',
      name: 'Seine River Dinner Cruise',
      type: 'food',
      description: 'Romantic dinner cruise along the Seine with live music and stunning views of illuminated monuments.',
      duration: '2.5 hours',
      location: 'Port de la Bourdonnais',
      groupSize: 'Large group',
      pricePerPerson: 95,
      rating: 4.7,
      reviews: 5432,
      provider: 'Bateaux Parisiens',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      bookingUrl: '#'
    },
    {
      id: 'paris_4',
      name: 'Versailles Palace & Gardens Tour',
      type: 'tour',
      description: 'Full-day tour of the magnificent Palace of Versailles with gardens, Grand Trianon, and Marie Antoinette\'s Estate.',
      duration: '8 hours',
      location: 'Versailles (20km from Paris)',
      groupSize: 'Small group (20 max)',
      pricePerPerson: 125,
      rating: 4.9,
      reviews: 6789,
      provider: 'GetYourGuide',
      image: 'https://images.unsplash.com/photo-1601797849277-62c5b2f6a607?w=800',
      bookingUrl: '#'
    },
    {
      id: 'paris_5',
      name: 'Montmartre Food & Wine Walking Tour',
      type: 'food',
      description: 'Explore Montmartre\'s culinary scene with cheese, wine, pastries, and chocolate tastings.',
      duration: '3 hours',
      location: 'Montmartre',
      groupSize: 'Small group (12 max)',
      pricePerPerson: 89,
      rating: 4.8,
      reviews: 3421,
      provider: 'Eating Europe',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
      bookingUrl: '#'
    },
    {
      id: 'paris_6',
      name: 'Moulin Rouge Cabaret Show',
      type: 'entertainment',
      description: 'Spectacular cabaret performance with optional champagne and dinner at the legendary Moulin Rouge.',
      duration: '2 hours',
      location: 'Boulevard de Clichy, Pigalle',
      groupSize: 'Large group',
      pricePerPerson: 135,
      rating: 4.6,
      reviews: 9876,
      provider: 'Moulin Rouge',
      image: 'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=800',
      bookingUrl: '#'
    }
  ],
  
  Tokyo: [
    {
      id: 'tokyo_1',
      name: 'Tokyo Skytree Observation Deck',
      type: 'attraction',
      description: 'Ascend to the tallest tower in Japan for breathtaking 360° views of Tokyo from 450 meters high.',
      duration: '1.5 hours',
      location: 'Sumida, Tokyo Skytree Town',
      groupSize: 'Individual entry',
      pricePerPerson: 35,
      rating: 4.7,
      reviews: 8234,
      provider: 'Klook',
      image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800',
      bookingUrl: '#'
    },
    {
      id: 'tokyo_2',
      name: 'Tsukiji Fish Market Food Tour',
      type: 'food',
      description: 'Early morning tour of Tsukiji Outer Market with sushi breakfast and local delicacies.',
      duration: '3 hours',
      location: 'Tsukiji, Chuo',
      groupSize: 'Small group (10 max)',
      pricePerPerson: 115,
      rating: 4.9,
      reviews: 4532,
      provider: 'Magical Trip',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      bookingUrl: '#'
    },
    {
      id: 'tokyo_3',
      name: 'TeamLab Borderless Digital Art Museum',
      type: 'culture',
      description: 'Immersive digital art experience with interactive installations and stunning light displays.',
      duration: '2 hours',
      location: 'Odaiba',
      groupSize: 'Individual entry',
      pricePerPerson: 42,
      rating: 4.8,
      reviews: 12453,
      provider: 'TeamLab',
      image: 'https://images.unsplash.com/photo-1598875791852-8bb153cc0d31?w=800',
      bookingUrl: '#'
    },
    {
      id: 'tokyo_4',
      name: 'Mount Fuji Day Trip with Lake Kawaguchi',
      type: 'tour',
      description: 'Full-day tour to Mt. Fuji, Lake Kawaguchi, and Oshino Hakkai village with lunch included.',
      duration: '10 hours',
      location: 'Pickup from Tokyo',
      groupSize: 'Small group (15 max)',
      pricePerPerson: 145,
      rating: 4.7,
      reviews: 6234,
      provider: 'Viator',
      image: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800',
      bookingUrl: '#'
    }
  ],

  London: [
    {
      id: 'london_1',
      name: 'Tower of London Crown Jewels Tour',
      type: 'culture',
      description: 'Explore the historic Tower of London and see the spectacular Crown Jewels with an expert guide.',
      duration: '3 hours',
      location: 'Tower Hill',
      groupSize: 'Small group (20 max)',
      pricePerPerson: 55,
      rating: 4.8,
      reviews: 9876,
      provider: 'Historic Royal Palaces',
      image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800',
      bookingUrl: '#'
    },
    {
      id: 'london_2',
      name: 'West End Theatre Show',
      type: 'entertainment',
      description: 'Premium seats for top West End musical productions including The Lion King, Hamilton, or Phantom.',
      duration: '2.5 hours',
      location: 'West End Theatre District',
      groupSize: 'Individual booking',
      pricePerPerson: 95,
      rating: 4.9,
      reviews: 15432,
      provider: 'Official London Theatre',
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
      bookingUrl: '#'
    },
    {
      id: 'london_3',
      name: 'British Museum Guided Tour',
      type: 'culture',
      description: 'Discover ancient artifacts including the Rosetta Stone and Egyptian mummies with expert commentary.',
      duration: '2.5 hours',
      location: 'Bloomsbury',
      groupSize: 'Small group (15 max)',
      pricePerPerson: 45,
      rating: 4.8,
      reviews: 7234,
      provider: 'GetYourGuide',
      image: 'https://images.unsplash.com/photo-1555848962-6e79363bfa19?w=800',
      bookingUrl: '#'
    }
  ],

  // Generic activities for other cities
  default: [
    {
      id: 'default_1',
      name: 'City Walking Tour',
      type: 'tour',
      description: 'Explore the city\'s main attractions and hidden gems with a knowledgeable local guide.',
      duration: '3 hours',
      location: 'City Center',
      groupSize: 'Small group (15 max)',
      pricePerPerson: 35,
      rating: 4.6,
      reviews: 1234,
      provider: 'Free Walking Tours',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      bookingUrl: '#'
    },
    {
      id: 'default_2',
      name: 'Food Tasting Tour',
      type: 'food',
      description: 'Sample authentic local cuisine at the best restaurants and street food stalls in the city.',
      duration: '3.5 hours',
      location: 'Historic District',
      groupSize: 'Small group (12 max)',
      pricePerPerson: 75,
      rating: 4.8,
      reviews: 2341,
      provider: 'Local Food Tours',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      bookingUrl: '#'
    },
    {
      id: 'default_3',
      name: 'Museum & Art Gallery Pass',
      type: 'culture',
      description: 'Visit the city\'s top museums and art galleries with skip-the-line access.',
      duration: '4 hours',
      location: 'Museum District',
      groupSize: 'Individual entry',
      pricePerPerson: 45,
      rating: 4.5,
      reviews: 3456,
      provider: 'City Pass',
      image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800',
      bookingUrl: '#'
    },
    {
      id: 'default_4',
      name: 'Sunset Boat Tour',
      type: 'tour',
      description: 'Scenic boat cruise along the waterfront with spectacular sunset views and commentary.',
      duration: '2 hours',
      location: 'Harbor',
      groupSize: 'Large group',
      pricePerPerson: 55,
      rating: 4.7,
      reviews: 4567,
      provider: 'Harbor Cruises',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      bookingUrl: '#'
    }
  ]
};

export function getMockActivities(city, preferences = []) {
  // Get city-specific activities or default
  let activities = CITY_ACTIVITIES[city] || CITY_ACTIVITIES.default;
  
  // Filter by preferences if provided
  if (preferences.length > 0) {
    const filtered = activities.filter(activity => 
      preferences.some(pref => 
        activity.type.toLowerCase().includes(pref.toLowerCase()) ||
        activity.description.toLowerCase().includes(pref.toLowerCase())
      )
    );
    
    // If filters are too restrictive, return all activities
    if (filtered.length > 0) {
      activities = filtered;
    }
  }
  
  return activities;
}

export function getActivityById(activityId) {
  const allActivities = Object.values(CITY_ACTIVITIES).flat();
  return allActivities.find(a => a.id === activityId);
}