/**
 * Countries Table Schema
 * Defines the structure of the 'countries' table in the database
 */

export const CountriesTable = {
  tableName: 'countries',
  schema: 'catalogues',
  
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
    acronym: {
      type: 'varchar(3)',
      nullable: true
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['name'], unique: true },
    { columns: ['acronym'] }
  ]
};

/**
 * States Table Schema
 * Defines the structure of the 'states' table
 */
export const StatesTable = {
  tableName: 'states',
  schema: 'catalogues',
  
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
    countryid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'countries',
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
    { columns: ['countryid'] },
    { columns: ['name', 'countryid'], unique: true }
  ]
};

/**
 * Cities Table Schema
 * Defines the structure of the 'cities' table
 */
export const CitiesTable = {
  tableName: 'cities',
  schema: 'catalogues',
  
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
    stateid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'states',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    countryid: {
      type: 'integer',
      nullable: false,
      foreignKey: {
        table: 'countries',
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
    { columns: ['stateid'] },
    { columns: ['countryid'] },
    { columns: ['name', 'stateid'], unique: true }
  ]
};

export default {
  CountriesTable,
  StatesTable,
  CitiesTable
};
