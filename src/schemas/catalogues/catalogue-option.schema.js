import { z } from 'zod';

const CATALOGUE_OPTIONS = ['country', 'state', 'city', 'facility'];

const catalogueOptionSchema = z.enum(CATALOGUE_OPTIONS);

const idSchema = z.coerce.number().int().positive();

const stringField = () => z.string().trim().min(1);
const integerField = () => z.coerce.number().int().positive();

const hideField = z.union([
    z.boolean(),
    z.string().transform((value, ctx) => {
        const normalized = value.toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Field 'hide' must be a boolean"
        });

        return z.NEVER;
    })
]);

const createPayloadSchemas = {
    country: z.object({
        name: stringField(),
        acronym: stringField(),
        originalname: stringField().optional(),
        hide: hideField.optional()
    }),
    state: z.object({
        name: stringField(),
        countryid: integerField(),
        originalname: stringField().optional(),
        hide: hideField.optional()
    }),
    city: z.object({
        name: stringField(),
        countryid: integerField(),
        stateid: integerField(),
        originalname: stringField().optional(),
        hide: hideField.optional()
    }),
    facility: z.object({
        name: stringField(),
        code: stringField(),
        hide: hideField.optional()
    })
};

const updatePayloadSchemas = {
    country: z.object({
        name: stringField().optional(),
        acronym: stringField().optional(),
        originalname: stringField().optional(),
        hide: hideField.optional()
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'No valid fields provided to update'
    }),
    state: z.object({
        name: stringField().optional(),
        countryid: integerField().optional(),
        originalname: stringField().optional(),
        hide: hideField.optional()
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'No valid fields provided to update'
    }),
    city: z.object({
        name: stringField().optional(),
        countryid: integerField().optional(),
        stateid: integerField().optional(),
        originalname: stringField().optional(),
        hide: hideField.optional()
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'No valid fields provided to update'
    }),
    facility: z.object({
        name: stringField().optional(),
        code: stringField().optional(),
        hide: hideField.optional()
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'No valid fields provided to update'
    })
};

function mapIssueToMessage(issue) {
    const [field] = issue.path;

    if (!field) {
        return issue.message;
    }

    if (issue.message === "Field 'hide' must be a boolean") {
        return issue.message;
    }

    if (issue.code === 'invalid_type') {
        if (['countryid', 'stateid'].includes(field)) {
            return `Field '${field}' must be a positive integer`;
        }

        if (field === 'hide') {
            return "Field 'hide' must be a boolean";
        }

        return `Field '${field}' must be a string`;
    }

    if (issue.code === 'too_small') {
        if (['countryid', 'stateid'].includes(field)) {
            return `Field '${field}' must be a positive integer`;
        }

        return `Field '${field}' cannot be empty`;
    }

    if (issue.code === 'invalid_enum_value') {
        return 'Invalid option';
    }

    return issue.message;
}

function getFirstErrorMessage(error, fallbackMessage) {
    const issue = error.issues?.[0];
    if (!issue) return fallbackMessage;
    return mapIssueToMessage(issue) || fallbackMessage;
}

export {
    CATALOGUE_OPTIONS,
    catalogueOptionSchema,
    idSchema,
    createPayloadSchemas,
    updatePayloadSchemas,
    getFirstErrorMessage
};