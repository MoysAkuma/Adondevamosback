# Database Table Schemas

This folder contains all database table schema definitions for the AdondeVamos application.

## Structure

- **users.table.js** - User-related tables (users, admins, confirmations)
- **trips.table.js** - Trip-related tables (trips, trips_itinerary, trips_members, trips_gallery)
- **places.table.js** - Place-related tables (places, facilities, places_facilities)
- **catalogues.table.js** - Catalogue/Location tables (countries, states, cities)
- **votes.table.js** - Vote tables (trips, places, trips_itineraries votes)
- **index.js** - Central export point for all schemas

## Usage

### Import specific table schema:
```javascript
import { UsersTable, TripsTable } from './models/schemas/index.js';

console.log(UsersTable.tableName); // 'users'
console.log(UsersTable.columns.email.type); // 'varchar'
```

### Import all schemas:
```javascript
import DatabaseSchema from './models/schemas/index.js';

// Access specific table
const usersTable = await DatabaseSchema.users.users();
```

### Get all table names:
```javascript
import { getAllTableNames } from './models/schemas/index.js';

const tables = getAllTableNames();
// ['users', 'admins', 'confirmations', 'trips', ...]
```

### Get table schema dynamically:
```javascript
import { getTableSchema } from './models/schemas/index.js';

const schema = await getTableSchema('users');
console.log(schema.columns);
```

## Schema Structure

Each table schema follows this format:

```javascript
export const TableName = {
  tableName: 'table_name',
  schema: 'public', // or 'votes', etc.
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    // ... other columns
  },
  
  indexes: [
    { columns: ['column_name'], unique: true }
  ]
};
```

## Database Tables

### Public Schema

**Users Domain:**
- `users` - User accounts
- `admins` - Admin users
- `confirmations` - Email confirmation tokens

**Trips Domain:**
- `trips` - Trip information
- `trips_itinerary` - Places in trip itinerary
- `trips_members` - Trip members
- `trips_gallery` - Trip images

**Places Domain:**
- `places` - Place information
- `facilities` - Available facilities
- `places_facilities` - Place-facility relationships

**Catalogues Domain:**
- `countries` - Country catalogue
- `states` - State/province catalogue
- `cities` - City catalogue

### Votes Schema

- `trips` - Trip votes
- `places` - Place votes
- `trips_itineraries` - Itinerary place votes

## Notes

- All tables include `createddate` timestamp (default: now())
- Most tables include `updateddate` timestamp for tracking modifications
- Foreign key relationships are documented with `onDelete` policies
- Indexes are defined for performance optimization
- UUID tokens are auto-generated for confirmations table
