import { uuid, z } from 'zod';

const stringField = () => z.string().trim().min(1);

const dateField = () => z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format'
});

const createTripSchema = z.object({
    name: stringField()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters'),
    description: z.string()
        .trim()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    initialdate: dateField(),
    finaldate: dateField(),
    orden: z.coerce.number().int().min(0).optional()
}).refine((data) => data.finaldate >= data.initialdate, {
    message: 'Final date must be equal to or after the initial date',
    path: ['finaldate']
});

const updateTripSchema = z.object({
    name: stringField()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters')
        .optional(),
    description: z.string()
        .trim()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    initialdate: dateField().optional(),
    finaldate: dateField().optional(),
    orden: z.coerce.number().int().min(0).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'No valid fields provided to update'
}).refine((data) => {
    if (data.initialdate && data.finaldate) {
        return data.finaldate >= data.initialdate;
    }
    return true;
}, {
    message: 'Final date must be equal to or after the initial date',
    path: ['finaldate']
});

const tripIdSchema = z.coerce.number().int().positive({
    message: 'Trip ID must be a positive integer'
});

const imageIdSchema = z.coerce.number().int().positive({
    message: 'Image ID must be a positive integer'
});

const itineraryPlaceSchema = z.object({
    placeid: z.coerce.number().int().positive({
        message: 'Place ID must be a positive integer'
    }),
    initialdate: dateField(),
    finaldate: dateField(),
    orden: z.coerce.number().int().min(0).optional()
}).refine((data) => data.finaldate >= data.initialdate, {
    message: 'Final date must be equal to or after the initial date',
    path: ['finaldate']
});

const createCommentSchema = z.object({
    title: stringField().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
    body: stringField().min(1, 'Content must be at least 1 character').max(500, 'Content must be at most 500 characters'),
    trip_id: tripIdSchema,
    userid: z.coerce.number().int().positive({
        message: 'User ID must be a positive integer'
    }),
    answer_to: uuids().optional()
});

const updateCommentSchema = z.object({
    title: stringField().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters').optional(),
    body: stringField().min(1, 'Content must be at least 1 character').max(500, 'Content must be at most 500 characters').optional(),
    answer_to: uuids().optional()
});

const getFirstErrorMessage = (error, fallback = 'Validation error') => {
    if (error?.errors?.length > 0) {
        const firstError = error.errors[0];
        const path = firstError.path?.join('.') || '';
        return path ? `${path}: ${firstError.message}` : firstError.message;
    }
    return fallback;
};

export {
    createTripSchema,
    updateTripSchema,
    tripIdSchema,
    imageIdSchema,
    itineraryPlaceSchema,
    createCommentSchema,
    updateCommentSchema,
    getFirstErrorMessage
};
