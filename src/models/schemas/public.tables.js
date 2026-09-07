/**
 *Public votes_results_trips Schemas
 * Defines the structure of the 'votes_results_trips' table in the database
 */

export const votes_results_trips = {
    tableName: 'votes_results_trips',
    schema: 'public',
    columns: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
            nullable: false
        },
        createddate: {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: false
        },
        first : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        second : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        third : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        oudateddate : {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        generatedby : {
            type: 'VARCHAR(30)',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        }
    }
};

/**
 *Public votes_results_places Schemas
 * Defines the structure of the 'votes_results_places' table in the database
 */

export const votes_results_places = {
    tableName: 'votes_results_places',
    schema: 'public',
    columns: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
            nullable: false
        },
        createddate: {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: false
        },
        first : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        second : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        third : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        oudateddate : {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        generatedby : {
            type: 'VARCHAR(30)',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        }
    }
};

/**
 *Public votes_results_itinerary Schemas
 * Defines the structure of the 'votes_results_itinerary' table in the database
 */

export const votes_results_itinerary = {
    tableName: 'votes_results_itinerary',
    schema: 'public',
    columns: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
            nullable: false
        },
        createddate: {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: false
        },
        first : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        second : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        third : {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        oudateddate : {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        generatedby : {
            type: 'VARCHAR(30)',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        }
    }
};

/**
 *Public config Schemas
 * Defines the structure of the 'config' table in the database
 */

export const config = {
    tableName: 'config',
    schema: 'public',
    columns: {
        id: {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
            nullable: false
        },
        updateddate: {
            type: 'timestamp',
            primaryKey: false,
            autoIncrement: false,
            nullable: false
        },
        trip_destacado: {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
        place_destacado: {
            type: 'integer',
            primaryKey: false,
            autoIncrement: false,
            nullable: true
        },
    }
};