const CATALOGUE_OPTIONS = ['country', 'state', 'city', 'facility'];

const MODEL_CONFIG = {
    country: {
        requiredCreate: ['name', 'acronym'],
        optionalCreate: ['originalname', 'hide'],
        allowedUpdate: ['name', 'acronym', 'originalname', 'hide']
    },
    state: {
        requiredCreate: ['name', 'countryid'],
        optionalCreate: ['originalname', 'hide'],
        allowedUpdate: ['name', 'countryid', 'originalname', 'hide']
    },
    city: {
        requiredCreate: ['name', 'countryid', 'stateid'],
        optionalCreate: ['originalname', 'hide'],
        allowedUpdate: ['name', 'countryid', 'stateid', 'originalname', 'hide']
    },
    facility: {
        requiredCreate: ['name', 'code'],
        optionalCreate: ['hide'],
        allowedUpdate: ['name', 'code', 'hide']
    }
};

const INTEGER_FIELDS = new Set(['countryid', 'stateid']);
const BOOLEAN_FIELDS = new Set(['hide']);
const STRING_FIELDS = new Set(['name', 'acronym', 'originalname', 'code']);

function normalizeValue(field, value) {
    if (value === undefined || value === null) return value;

    if (STRING_FIELDS.has(field)) {
        if (typeof value !== 'string') {
            throw new Error(`Field '${field}' must be a string`);
        }

        const normalized = value.trim();
        if (!normalized) {
            throw new Error(`Field '${field}' cannot be empty`);
        }

        return normalized;
    }

    if (INTEGER_FIELDS.has(field)) {
        const numeric = Number(value);
        if (!Number.isInteger(numeric) || numeric <= 0) {
            throw new Error(`Field '${field}' must be a positive integer`);
        }
        return numeric;
    }

    if (BOOLEAN_FIELDS.has(field)) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        throw new Error(`Field '${field}' must be a boolean`);
    }

    return value;
}

function normalizePayload(data, fields) {
    const payload = {};

    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            payload[field] = normalizeValue(field, data[field]);
        }
    }

    return payload;
}

function ensureValidOption(option) {
    if (!CATALOGUE_OPTIONS.includes(option)) {
        throw new Error('Invalid option');
    }
}

class CatalogueOptionModel {
    static validateOption(option) {
        ensureValidOption(option);
        return option;
    }

    static validateId(id) {
        const parsed = Number(id);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            throw new Error('Invalid ID');
        }
        return parsed;
    }

    static forCreate(option, data) {
        ensureValidOption(option);

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Request body must be an object');
        }

        const config = MODEL_CONFIG[option];
        const allowedFields = [...config.requiredCreate, ...config.optionalCreate];
        const payload = normalizePayload(data, allowedFields);

        for (const requiredField of config.requiredCreate) {
            if (!Object.prototype.hasOwnProperty.call(payload, requiredField)) {
                throw new Error(`Missing required field '${requiredField}'`);
            }
        }

        return payload;
    }

    static forUpdate(option, data) {
        ensureValidOption(option);

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Request body must be an object');
        }

        const config = MODEL_CONFIG[option];
        const payload = normalizePayload(data, config.allowedUpdate);

        if (Object.keys(payload).length === 0) {
            throw new Error('No valid fields provided to update');
        }

        return payload;
    }
}

export { CATALOGUE_OPTIONS, CatalogueOptionModel };
