/**
 * Places Table Schema
 * Defines the structure of the 'places' table in the database
 */

export const PlacesTable = {
  tableName: 'places',
  schema: 'places',
  
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
    countryid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'countries',
        column: 'id'
      }
    },
    stateid: {
      type: 'integer',
      nullable: true,
      foreignKey: {
        table: 'states',
        column: 'id'
      }
    },
    cityid: {
      type: 'integer',
      nullable: true,
      foreignKey: {
        table: 'cities',
        column: 'id'
      }
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
    { columns: ['name'] },
    { columns: ['countryid'] },
    { columns: ['stateid'] },
    { columns: ['cityid'] },
    { columns: ['ownerid'] }
  ]
};

/**
 * Facilities Table Schema
 * Defines the structure of the 'facilities' table
 */
export const FacilitiesTable = {
  tableName: 'facilities',
  schema: 'places',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    name: {
      type: 'varchar',
      nullable: false,
      unique: true
    },
    description: {
      type: 'text',
      nullable: true
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['name'], unique: true }
  ]
};

/**
 * Places Facilities Table Schema
 * Defines the relationship between places and facilities
 */
export const PlacesFacilitiesTable = {
  tableName: 'places_facilities',
  schema: 'places',
  
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
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    facilityid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'facilities',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['placeid'] },
    { columns: ['facilityid'] },
    { columns: ['placeid', 'facilityid'], unique: true }
  ]
};

export default {
  PlacesTable,
  FacilitiesTable,
  PlacesFacilitiesTable
};
