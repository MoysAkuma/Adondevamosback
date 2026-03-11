import {
    CATALOGUE_OPTIONS,
    catalogueOptionSchema,
    idSchema,
    createPayloadSchemas,
    updatePayloadSchemas,
    getFirstErrorMessage
} from '../schemas/catalogues/catalogue-option.schema.js';

class CatalogueOptionModel {
    static validateOption(option) {
        const result = catalogueOptionSchema.safeParse(option);
        if (!result.success) {
            throw new Error('Invalid option');
        }

        return result.data;
    }

    static validateId(id) {
        const result = idSchema.safeParse(id);
        if (!result.success) {
            throw new Error('Invalid ID');
        }

        return result.data;
    }

    static forCreate(option, data) {
        const selectedOption = this.validateOption(option);

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Request body must be an object');
        }

        const result = createPayloadSchemas[selectedOption].safeParse(data);
        if (!result.success) {
            throw new Error(getFirstErrorMessage(result.error, 'Invalid payload'));
        }

        return result.data;
    }

    static forUpdate(option, data) {
        const selectedOption = this.validateOption(option);

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Request body must be an object');
        }

        const result = updatePayloadSchemas[selectedOption].safeParse(data);
        if (!result.success) {
            throw new Error(getFirstErrorMessage(result.error, 'Invalid payload'));
        }

        return result.data;
    }
}

export { CATALOGUE_OPTIONS, CatalogueOptionModel };
