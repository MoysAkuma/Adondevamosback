import { createPlaceSchema, getCreatePlaceErrorMessage } from '../schemas/places/place-create.schema.js';

class PlaceModel {
  static forCreate(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Request body must be an object');
    }

    const result = createPlaceSchema.safeParse(data);

    if (!result.success) {
      throw new Error(getCreatePlaceErrorMessage(result.error));
    }

    return result.data;
  }
}

export { PlaceModel };
