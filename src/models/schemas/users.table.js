/**
 * Users Table Schema
 * Defines the structure of the 'users' table in the database
 */

export const UsersTable = {
  tableName: 'users',
  schema: 'users',
  
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
    lastname: {
      type: 'varchar',
      nullable: true
    },
    secondname: {
      type: 'varchar',
      nullable: true
    },
    tag: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    countryid: {
      type: 'integer',
      nullable: true,
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
    enabled: {
      type: 'boolean',
      default: true,
      nullable: false
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
    },
    updateddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['email'], unique: true },
    { columns: ['tag'], unique: true },
    { columns: ['countryid'] },
    { columns: ['stateid'] },
    { columns: ['cityid'] }
  ]
};

/**
 * Admins Table Schema
 * Defines the structure of the 'admins' table
 */
export const AdminsTable = {
  tableName: 'admins',
  schema: 'users',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
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
    enabled: {
      type: 'boolean',
      default: true,
      nullable: false
    },
    createddate: {
      type: 'timestamp',
      default: 'now()',
      nullable: false
    }
  },

  indexes: [
    { columns: ['userid'], unique: true }
  ]
};

/**
 * Email Confirmations Table Schema
 * Defines the structure of the 'confirmations' table
 */
export const ConfirmationsTable = {
  tableName: 'confirmations',
  schema: 'users',
  
  columns: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    token: {
      type: 'uuid',
      default: 'gen_random_uuid()',
      unique: true,
      nullable: false
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
    email: {
      type: 'varchar',
      nullable: false
    },
    expirationstamp: {
      type: 'timestamp',
      nullable: false
    },
    confirmed: {
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
    { columns: ['token'], unique: true },
    { columns: ['userid'] },
    { columns: ['email'] }
  ]
};

export default {
  UsersTable,
  AdminsTable,
  ConfirmationsTable
};
