import { z } from 'zod';

const stringField = () => z.string().trim().min(1);

const createPlaceSchema = z.object({
    name: stringField()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters'),
    address: stringField()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be at most 200 characters'),
    description: z.string()
        .trim()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    ispublic: z.boolean({
        invalid_type_error: 'ispublic must be a boolean'
    }).default(true),
    latitude: z.coerce.number({
        invalid_type_error: 'Latitude must be a number'
    }).min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional(),
    longitude: z.coerce.number({
        invalid_type_error: 'Longitude must be a number'
    }).min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional(),
    countryid: z.coerce.number().int().positive({
        message: 'Country ID must be a positive integer'
    }).optional(),
    stateid: z.coerce.number().int().positive({
        message: 'State ID must be a positive integer'
    }).optional(),
    cityid: z.coerce.number().int().positive({
        message: 'City ID must be a positive integer'
    }).optional()
});

const updatePlaceSchema = z.object({
    name: stringField()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters')
        .optional(),
    address: stringField()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be at most 200 characters')
        .optional(),
    description: z.string()
        .trim()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    ispublic: z.boolean({
        invalid_type_error: 'ispublic must be a boolean'
    }).optional(),
    latitude: z.coerce.number({
        invalid_type_error: 'Latitude must be a number'
    }).min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional(),
    longitude: z.coerce.number({
        invalid_type_error: 'Longitude must be a number'
    }).min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional(),
    countryid: z.coerce.number().int().positive({
        message: 'Country ID must be a positive integer'
    }).optional(),
    stateid: z.coerce.number().int().positive({
        message: 'State ID must be a positive integer'
    }).optional(),
    cityid: z.coerce.number().int().positive({
        message: 'City ID must be a positive integer'
    }).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'No valid fields provided to update'
});

const placeIdSchema = z.coerce.number().int().positive({
    message: 'Place ID must be a positive integer'
});

export { createPlaceSchema, updatePlaceSchema, placeIdSchema };
