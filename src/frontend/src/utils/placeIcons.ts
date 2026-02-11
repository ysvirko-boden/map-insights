/**
 * Maps Google Places API types to appropriate emoji icons
 */

/**
 * Get icon for a place type
 * @param type - Google Places API type identifier
 * @returns Emoji icon representing the place type
 */
export function getPlaceIcon(type: string): string {
  const iconMap: Record<string, string> = {
    // Food & Dining
    restaurant: '🍽️',
    cafe: '☕',
    coffee_shop: '☕',
    bar: '🍺',
    bakery: '🥖',
    meal_takeaway: '🥡',
    meal_delivery: '🥡',
    food: '🍴',
    fast_food: '🍔',
    fast_food_restaurant: '🍔',
    fastfoodrestaurant: '🍔',
    hamburger_restaurant: '🍔',
    pizza_restaurant: '🍕',
    sandwich_shop: '🥪',
    kebab_restaurant: '🥙',
    chinese_restaurant: '🥢',
    japanese_restaurant: '🍱',
    sushi_restaurant: '🍱',
    noodle_restaurant: '🍜',
    seafood_restaurant: '🦞',
    steakhouse: '🥩',
    ice_cream_shop: '🍦',
    dessert_shop: '🍰',
    juice_bar: '🧃',
    tea_house: '🍵',
    
    // Shopping
    shopping_mall: '🛍️',
    shopping_center: '🛍️',
    shopping_centre: '🛍️',
    store: '🏪',
    clothing_store: '👕',
    department_store: '🏬',
    supermarket: '🛒',
    grocery_store: '🛒',
    grocery_or_supermarket: '🛒',
    convenience_store: '🏪',
    market: '🛒',
    flea_market: '🛒',
    farmers_market: '🛒',
    food_market: '🛒',
    retail: '🏪',
    retail_store: '🏪',
    discount_store: '🛒',
    hypermarket: '🛒',
    mini_mart: '🏪',
    grocerystore: '🛒',
    liquorstore: '🍷',
    liquor_store: '🍷',
    
    // Attractions & Culture
    tourist_attraction: '🎯',
    museum: '🏛️',
    art_gallery: '🎨',
    landmark: '🏛️',
    aquarium: '🐠',
    zoo: '🦁',
    amusement_park: '🎢',
    amusementpark: '🎢',
    castle: '🏰',
    city_hall: '🏛️',
    town_square: '🏛️',
    monument: '🗿',
    place_of_worship: '⛪',
    cathedral: '⛪',
    chapel: '⛪',
    basilica: '⛪',
    shrine: '⛪',
    gate: '🚪',
    arch: '🏛️',
    town_hall: '🏛️',
    cultural_center: '🎭',
    cultural_centre: '🎭',
    heritage_site: '🏛️',
    historic_building: '🏛️',
    fortification: '🏰',
    viewpoint: '🏔️',
    scenic_lookout: '🏔️',
    memorial: '🗿',
    war_memorial: '🗿',
    plaza: '🏛️',
    square: '🏛️',
    religious_site: '⛪',
    pilgrimage_site: '⛪',
    cemetery: '🪦',
    
    // Nature & Parks
    park: '🌳',
    natural_feature: '🏞️',
    campground: '🏕️',
    garden: '🌳',
    botanical_garden: '🌳',
    national_park: '🏞️',
    nature_reserve: '🏞️',
    forest: '🌲',
    lake: '🏞️',
    river: '🏞️',
    beach: '🏖️',
    
    // Healthcare
    pharmacy: '💊',
    hospital: '🏥',
    doctor: '⚕️',
    dentist: '🦷',
    
    // Services
    atm: '🏧',
    bank: '🏦',
    post_office: '📮',
    laundry: '🧺',
    spa: '💆',
    hair_care: '💇',
    beauty_salon: '💅',
    car_wash: '🧼',
    carwash: '🧼',
    
    // Transportation
    gas_station: '⛽',
    parking: '🅿️',
    transit_station: '🚉',
    bus_station: '🚌',
    train_station: '🚂',
    subway_station: '🚇',
    airport: '✈️',
    car_rental: '🚗',
    
    // Nightlife & Entertainment
    night_club: '🎵',
    casino: '🎰',
    movie_theater: '🎬',
    bowling_alley: '🎳',
    
    // Accommodation
    lodging: '🏨',
    hotel: '🏨',
    
    // Religious
    church: '⛪',
    mosque: '🕌',
    synagogue: '🕍',
    hindu_temple: '🛕',
    
    // Education
    school: '🏫',
    university: '🎓',
    library: '📚',
    
    // Towers & Observation Points
    tower: '🗼',
    observation_deck: '🗼',
    lighthouse: '🗼',
    tv_tower: '🗼',
    radio_tower: '🗼',
    communications_tower: '🗼',
    
    // Historical Buildings
    palace: '🏛️',
    fort: '🏰',
    historic_site: '🏛️',
    ruins: '🏛️',
    archaeological_site: '🏛️',
    
    // Government & Civic
    embassy: '🏛️',
    government_office: '🏛️',
    courthouse: '⚖️',
    police: '🚔',
    fire_station: '🚒',
    local_government_office: '🏛️',
    
    // Cultural Facilities
    art_center: '🎨',
    concert_hall: '🎵',
    opera_house: '🎭',
    theater: '🎭',
    theatre: '🎭',
    performing_arts_theater: '🎭',
    
    // Specialized Buildings
    prison: '🏢',
    jail: '🏢',
    embassy_of: '🏛️',
    consulate: '🏛️',
    convention_center: '🏢',
    
    // Sports & Recreation
    gym: '🏋️',
    stadium: '🏟️',
    swimming_pool: '🏊',
    sports_center: '⚽',
    sports_complex: '⚽',
    sportscomplex: '⚽',
    
    // Generic/Fallback (these appear in many places)
    point_of_interest: '🎯',
    pointofinterest: '🎯',
    establishment: '🏢',
    premise: '🏢',
    locality: '🏛️',
    neighborhood: '🏘️',
    sublocality: '🏘️',
    political: '🏛️',
    route: '🛣️',
    street_address: '📍',
  };
  
  return iconMap[type] || '📍'; // Default to pin icon if type not found
}
