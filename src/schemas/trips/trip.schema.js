import { z } from 'zod';

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
    finaldate: dateField()
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
    finaldate: dateField().optional()
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
    getFirstErrorMessage
};
