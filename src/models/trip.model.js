import {
    createTripSchema,
    updateTripSchema,
    tripIdSchema,
    imageIdSchema,
    itineraryPlaceSchema,
    getFirstErrorMessage,
    createCommentSchema
} from '../schemas/trips/trip.schema.js';
import { ApiError } from '../utils/apiError.js';

class TripModel {
    static validateId(id) {
        const result = tripIdSchema.safeParse(id);
        if (!result.success) {
            throw new ApiError(400, getFirstErrorMessage(result.error, 'Invalid Trip ID'));
        }
        return result.data;
    }

    static validateImageId(id) {
        const result = imageIdSchema.safeParse(id);
        if (!result.success) {
            throw new ApiError(400, getFirstErrorMessage(result.error, 'Invalid Image ID'));
        }
        return result.data;
    }

    static forCreate(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ApiError(400, 'Request body must be an object');
        }

        const result = createTripSchema.safeParse(data);
        if (!result.success) {
            throw new ApiError(400, getFirstErrorMessage(result.error, 'Invalid trip data'));
        }

        return result.data;
    }

    static forUpdate(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ApiError(400, 'Request body must be an object');
        }

        const result = updateTripSchema.safeParse(data);
        if (!result.success) {
            throw new ApiError(400, getFirstErrorMessage(result.error, 'Invalid update data'));
        }

        return result.data;
    }

    static forItineraryPlace(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ApiError(400, 'Request body must be an object');
        }

        const result = itineraryPlaceSchema.safeParse(data);
        if (!result.success) {
            throw new ApiError(400, getFirstErrorMessage(result.error, 'Invalid itinerary place data'));
        }

        return result.data;
    }
    static forCreateComment(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ApiError(400, 'Request body must be an object');
        }

        const result = createCommentSchema.safeParse(data);
        if (!result.success) {
            throw new ApiError(400, getFirstErrorMessage(result.error, 'Invalid comment data'));
        }

        return result.data;
    }
    
}

export default TripModel;
