/**
 * High-level place categories for traveler-friendly filtering
 */
export type PlaceCategory =
  | 'food_dining'
  | 'coffee_shops'
  | 'groceries'
  | 'attractions'
  | 'shopping'
  | 'nature_parks'
  | 'healthcare'
  | 'services'
  | 'transportation'
  | 'nightlife';

/**
 * Mapping of high-level categories to Google Places API type identifiers
 */
export const CATEGORY_MAPPINGS: Record<PlaceCategory, string[]> = {
  food_dining: ['restaurant', 'cafe', 'bar', 'bakery', 'meal_takeaway'],
  coffee_shops: ['cafe', 'coffee_shop'],
  groceries: ['supermarket', 'grocery_store', 'convenience_store'],
  attractions: [
    'tourist_attraction',
    'museum',
    'art_gallery',
    'landmark',
    'point_of_interest',
    'aquarium',
    'zoo',
    'amusement_park',
    'beach',
  ],
  shopping: ['shopping_mall', 'store', 'clothing_store', 'department_store'],
  nature_parks: ['park', 'natural_feature', 'campground', 'beach'],
  healthcare: ['pharmacy', 'hospital', 'doctor'],
  services: ['atm', 'bank', 'post_office', 'laundry'],
  transportation: [
    'gas_station',
    'parking',
    'transit_station',
    'bus_station',
    'train_station',
  ],
  nightlife: ['night_club', 'bar', 'casino', 'movie_theater'],
};

/**
 * Human-readable labels for categories
 */
export function getCategoryLabel(category: PlaceCategory): string {
  const labels: Record<PlaceCategory, string> = {
    food_dining: 'Food & Dining',
    coffee_shops: 'Coffee Shops',
    groceries: 'Groceries & Essentials',
    attractions: 'Attractions & Culture',
    shopping: 'Shopping',
    nature_parks: 'Nature & Parks',
    healthcare: 'Healthcare',
    services: 'Services',
    transportation: 'Transportation',
    nightlife: 'Nightlife & Entertainment',
  };
  return labels[category];
}

/**
 * Material icon identifiers for categories
 */
export function getCategoryIcon(category: PlaceCategory): string {
  const icons: Record<PlaceCategory, string> = {
    food_dining: 'restaurant',
    coffee_shops: 'local_cafe',
    groceries: 'local_grocery_store',
    attractions: 'attractions',
    shopping: 'shopping_bag',
    nature_parks: 'park',
    healthcare: 'local_pharmacy',
    services: 'room_service',
    transportation: 'directions_bus',
    nightlife: 'nightlife',
  };
  return icons[category];
}

/**
 * Description text for categories
 */
export function getCategoryDescription(category: PlaceCategory): string {
  const descriptions: Record<PlaceCategory, string> = {
    food_dining: 'Restaurants, cafes, bars, and bakeries',
    coffee_shops: 'Coffee shops and cafes',
    groceries: 'Supermarkets, grocery stores, and convenience stores',
    attractions: 'Museums, landmarks, beaches, tourist attractions, and points of interest',
    shopping: 'Shopping malls, stores, and retail locations',
    nature_parks: 'Parks, beaches, natural features, and campgrounds',
    healthcare: 'Pharmacies, hospitals, and medical services',
    services: 'ATMs, banks, post offices, and laundry services',
    transportation: 'Gas stations, parking, and transit stations',
    nightlife: 'Night clubs, bars, casinos, and entertainment venues',
  };
  return descriptions[category];
}

/**
 * All available categories for iteration
 */
export const ALL_CATEGORIES: PlaceCategory[] = [
  'food_dining',
  'coffee_shops',
  'groceries',
  'attractions',
  'shopping',
  'nature_parks',
  'healthcare',
  'services',
  'transportation',
  'nightlife',
];
