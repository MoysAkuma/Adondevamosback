/**
 * Trips Votes Table Schema
 * Defines the structure of the votes schema 'trips' table
 */

export const TripsVotesTable = {
  tableName: 'trips',
  schema: 'votes',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    tripid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'trips',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    userid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'users',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    value: {
      type: 'boolean',
      nullable: false,
      default: false
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    },
    updateddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['tripid'] },
    { columns: ['userid'] },
    { columns: ['tripid', 'userid'], unique: true }
  ]
};

/**
 * Places Votes Table Schema
 * Defines the structure of the votes schema 'places' table
 */
export const PlacesVotesTable = {
  tableName: 'places',
  schema: 'votes',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    placeid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'places',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    userid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'users',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    value: {
      type: 'boolean',
      nullable: false,
      default: false
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    },
    updateddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['placeid'] },
    { columns: ['userid'] },
    { columns: ['placeid', 'userid'], unique: true }
  ]
};

/**
 * Trips Itineraries Votes Table Schema
 * Defines the structure of the votes schema 'trips_itineraries' table
 */
export const TripsItinerariesVotesTable = {
  tableName: 'trips_itineraries',
  schema: 'votes',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    tripid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'trips',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    placeid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'places',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    userid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'users',
        schema: 'public',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    value: {
      type: 'boolean',
      nullable: false,
      default: false
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    },
    updateddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['tripid'] },
    { columns: ['placeid'] },
    { columns: ['userid'] },
    { columns: ['tripid', 'placeid', 'userid'], unique: true }
  ]
};

export default {
  TripsVotesTable,
  PlacesVotesTable,
  TripsItinerariesVotesTable
};
