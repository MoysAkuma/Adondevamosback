/**
 * Database Table Schemas Index
 * Central export point for all table schema definitions
 */

// User-related tables
export { 
  UsersTable, 
  AdminsTable, 
  ConfirmationsTable 
} from './users.table.js';

// Trip-related tables
export { 
  TripsTable, 
  TripsItineraryTable, 
  TripsMembersTable, 
  TripsGalleryTable 
} from './trips.table.js';

// Place-related tables
export { 
  PlacesTable, 
  FacilitiesTable, 
  PlacesFacilitiesTable 
} from './places.table.js';

// Catalogue/Ubication tables
export { 
  CountriesTable, 
  StatesTable, 
  CitiesTable 
} from './catalogues.table.js';

// Vote tables
export { 
  TripsVotesTable, 
  PlacesVotesTable, 
  TripsItinerariesVotesTable 
} from './votes.table.js';

/**
 * All database tables organized by domain
 */
export const DatabaseSchema = {
  users: {
    users: () => import('./users.table.js').then(m => m.UsersTable),
    admins: () => import('./users.table.js').then(m => m.AdminsTable),
    confirmations: () => import('./users.table.js').then(m => m.ConfirmationsTable)
  },
  
  trips: {
    trips: () => import('./trips.table.js').then(m => m.TripsTable),
    trips_itinerary: () => import('./trips.table.js').then(m => m.TripsItineraryTable),
    trips_members: () => import('./trips.table.js').then(m => m.TripsMembersTable),
    trips_gallery: () => import('./trips.table.js').then(m => m.TripsGalleryTable)
  },
  
  places: {
    places: () => import('./places.table.js').then(m => m.PlacesTable),
    facilities: () => import('./places.table.js').then(m => m.FacilitiesTable),
    places_facilities: () => import('./places.table.js').then(m => m.PlacesFacilitiesTable)
  },
  
  catalogues: {
    countries: () => import('./catalogues.table.js').then(m => m.CountriesTable),
    states: () => import('./catalogues.table.js').then(m => m.StatesTable),
    cities: () => import('./catalogues.table.js').then(m => m.CitiesTable)
  },
  
  votes: {
    trips: () => import('./votes.table.js').then(m => m.TripsVotesTable),
    places: () => import('./votes.table.js').then(m => m.PlacesVotesTable),
    trips_itineraries: () => import('./votes.table.js').then(m => m.TripsItinerariesVotesTable)
  }
};

/**
 * Get all table names
 */
export const getAllTableNames = () => {
  const tables = [];
  for (const domain in DatabaseSchema) {
    for (const table in DatabaseSchema[domain]) {
      tables.push(table);
    }
  }
  return tables;
};

/**
 * Get table schema by name
 * @param {string} tableName - Name of the table
 * @returns {Promise<Object>} Table schema definition
 */
export const getTableSchema = async (tableName) => {
  for (const domain in DatabaseSchema) {
    if (DatabaseSchema[domain][tableName]) {
      return await DatabaseSchema[domain][tableName]();
    }
  }
  throw new Error(`Table schema not found: ${tableName}`);
};

export default DatabaseSchema;
