// Travel preferences
export const PREFERENCES = [
  { id: 'foodie', label: 'Foodie', emoji: '🍴' },
  { id: 'museums', label: 'Museums', emoji: '🏛️' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🏞️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'hidden_gems', label: 'Hidden Gems', emoji: '💎' },
  { id: 'chill', label: 'Chill', emoji: '😌' },
];

// Travel styles
export const TRAVEL_STYLES = {
  BUDGET: 'budget',
  BALANCED: 'balanced',
  PREMIUM: 'premium',
};

export const STYLE_LABELS = {
  [TRAVEL_STYLES.BUDGET]: 'Frugal',
  [TRAVEL_STYLES.BALANCED]: 'Balanced',
  [TRAVEL_STYLES.PREMIUM]: 'Splurge',
};

// Time of day
export const TIME_OF_DAY = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
};

// Budget ranges (for UI display)
export const BUDGET_RANGES = [
  { min: 0, max: 300, label: 'Budget' },
  { min: 300, max: 800, label: 'Moderate' },
  { min: 800, max: 2000, label: 'Comfortable' },
  { min: 2000, max: Infinity, label: 'Luxury' },
];
