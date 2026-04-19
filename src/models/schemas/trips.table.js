/**
 * Trips Table Schema
 * Defines the structure of the 'trips' table in the database
 */

export const TripsTable = {
  tableName: 'trips',
  schema: 'trips',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    name: {
      type: 'varchar',
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    initialdate: {
      type: 'date',
      nullable: false
    },
    finaldate: {
      type: 'date',
      nullable: false
    },
    isinternational: {
      type: 'boolean',
      default: false,
      nullable: false
    },
    ownerid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE'
      }
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
    { columns: ['ownerid'] },
    { columns: ['initialdate'] },
    { columns: ['finaldate'] },
    { columns: ['createddate'] }
  ]
};

/**
 * Trips Itinerary Table Schema
 * Defines the structure of the 'trips_itinerary' table
 */
export const TripsItineraryTable = {
  tableName: 'trips_itinerary',
  schema: 'trips',
  
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
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    placeid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'places',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    initialdate: {
      type: 'date',
      nullable: false
    },
    finaldate: {
      type: 'date',
      nullable: false
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['tripid'] },
    { columns: ['placeid'] },
    { columns: ['tripid', 'placeid'] }
  ]
};

/**
 * Trips Members Table Schema
 * Defines the structure of the 'trips_members' table
 */
export const TripsMembersTable = {
  tableName: 'trips_members',
  schema: 'trips',
  
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
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    userid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    hide: {
      type: 'boolean',
      default: false,
      nullable: false
    },
    createddate: {
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
 * Trips Gallery Table Schema
 * Defines the structure of the 'trips_gallery' table
 */
export const TripsGalleryTable = {
  tableName: 'trips_gallery',
  schema: 'trips',
  
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
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    filename: {
      type: 'varchar',
      nullable: false
    },
    completeurl: {
      type: 'text',
      nullable: false
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['tripid'] },
    { columns: ['filename'] }
  ]
};

export default {
  TripsTable,
  TripsItineraryTable,
  TripsMembersTable,
  TripsGalleryTable
};
