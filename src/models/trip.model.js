import {
    createTripSchema,
    updateTripSchema,
    tripIdSchema,
    getFirstErrorMessage
} from '../schemas/trips/trip.schema.js';

class TripModel {
    static validateId(id) {
        const result = tripIdSchema.safeParse(id);
        if (!result.success) {
            throw new Error(getFirstErrorMessage(result.error, 'Invalid Trip ID'));
        }
        return result.data;
    }

    static forCreate(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Request body must be an object');
        }

        const result = createTripSchema.safeParse(data);
        if (!result.success) {
            throw new Error(getFirstErrorMessage(result.error, 'Invalid trip data'));
        }

        return result.data;
    }

    static forUpdate(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Request body must be an object');
        }

        const result = updateTripSchema.safeParse(data);
        if (!result.success) {
            throw new Error(getFirstErrorMessage(result.error, 'Invalid update data'));
        }

        return result.data;
    }
}

export default TripModel;
