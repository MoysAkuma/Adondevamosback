import exceptions from '../middleware/exceptions.middleware.js';
import placesService from '../services/places.service.js';
import { getAuthenticatedUser } from '../utils/auth-user.js';
import { createPlaceSchema, updatePlaceSchema } from '../schemas/places/place.schema.js';
/**
 *  Recibes PlaceID as param and returns place info
 */
const getPlaceByID = async (req, res, next) => {
  try {
    //Get place id to search
    const { PlaceID } = req.params;

    const { userId } = getAuthenticatedUser(req);

    const place = await placesService.getPlaceById(PlaceID, userId);

    return res.success(
      'Reading process sucess', 
      place ? place : {});
  } catch (err) {
    next(err);
  }
};

/**
 * 
 */
const searchPlaces = async (req, res, next) => {
  try {
    //Get filters
    const { filters } = req.body;
    // Get pagination parameters from query string
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);

    const { data, pagination } = await placesService.searchPlaces(filters, undefined, page, limit);
    
    return res.success(
      'Reading process sucess', 
      data ? data : {},
      200,
      pagination);

  } catch (err) {
    next(err);
  }
};

const searchPlacesByField = async (req, res, next) => {
  try {
    //Get name filter
    const { field, name } = req.params;
    
    const foundedPlaces = await placesService.searchPlacesByField(field, name);

    return res.success(
      'Reading process sucess', 
      foundedPlaces ? foundedPlaces : {});
  } catch (err) {
    next(err);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;
    
    const images = req.body.images.map((img, index) => {
      if (!img.data) {
        throw exceptions.badRequest(`Image data is required for image at index ${index}`);
      }

      // Handle base64 data
      let buffer;
      if (img.data.startsWith('data:')) {
        // Extract base64 data from data URL
        const base64Data = img.data.split(',')[1];
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        buffer = Buffer.from(img.data, 'base64');
      }

      return {
        buffer: buffer,
        mimetype: img.mimetype || 'image/jpeg',
        extension: img.extension || 'jpg'
      };
    });

    if (!images || images.length === 0) {
      throw exceptions.badRequest('No images provided for upload');
    }

    const uploadResult = await placesService.uploadImages(PlaceID, images);

    return res.success(
      'Images uploaded successfully',
      uploadResult
    );
  } catch (error) {
    next(error);
  }
};

const createPlace = async (req, res, next) => {
  try {
    const validation = createPlaceSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      throw exceptions.badRequest(errorMessages);
    }
    const placeData = validation.data;
    const createResult = await placesService.createPlace(placeData);

    return res.success(
      'Place created successfully',
      createResult,
      201
    );
  } catch (error) {
    next(error);
  } 
};

const updatePlace = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;
    const validation = updatePlaceSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      throw exceptions.badRequest(errorMessages);
    }
    const placeData = validation.data;

    const updateResult = await placesService.updatePlace(PlaceID, placeData);
    return res.success(
      'Place updated successfully',
      updateResult
    );
  } catch (error) {
    next(error);
  }
};

const updateFacilities = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;
    const { Facilities } = req.body;
    if (!Array.isArray(Facilities)) {
      throw exceptions.badRequest('Facilities data must be an array');
    }
    const updateResult = await placesService.updateFacilities(PlaceID, Facilities);
    return res.success(
      'Facilities updated successfully',
      updateResult
    );
  } catch (error) {
    next(error);
  }
};

const addFacilities = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;
    const {Facilities} = req.body;
    if (!Array.isArray(Facilities)) {
      throw exceptions.badRequest('Facilities data must be an array');
    }
    const addResult = await placesService.addFacilities(PlaceID, Facilities);
    return res.success(
      'Facility added successfully',
      addResult
    );
  } catch (error) {
    next(error);
  }
};

const getNewPlaces = async (req, res, next) => {
  try{
    //get limit from params
    const { limit } = req.params;
    //get news places
    const places = await placesService.getNewPlaces(limit);
    return res.success(
      'Reading news places sucess', 
      places);
  } catch(err){
    next(err);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { PlaceID, ImageID } = req.params;
    
    if (!ImageID) {
      throw exceptions.badRequest('Image ID is required');
    }
    
    const deleteResult = await placesService.deleteImage(PlaceID, ImageID);
    
    return res.success(
      'Image deleted successfully',
      deleteResult
    );
  } catch (error) {
    next(error);
  }
};

const setCoverImage = async (req, res, next) => {
  try {
    const { PlaceID, ImageID } = req.params;
    
    if (!ImageID) {
      throw exceptions.badRequest('Image ID is required');
    }
    
    const result = await placesService.setCoverImage(PlaceID, ImageID);
    
    return res.success(
      'Cover image set successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

const updateImagesMetadata = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;

    if (!req.body.images || !Array.isArray(req.body.images)) {
      throw exceptions.badRequest('Images array is required in request body');
    }

    const metadata = req.body.images.map((img, index) => {
      const parsedImageId = Number(img.id);
      if (!Number.isFinite(parsedImageId) || parsedImageId <= 0) {
        throw exceptions.badRequest(`Invalid image id at index ${index}`);
      }

      const parsedCapturedDate =
        img.captureddate === null || img.captureddate === undefined || img.captureddate === ''
          ? null
          : String(img.captureddate).trim();

      if (parsedCapturedDate !== null && Number.isNaN(Date.parse(parsedCapturedDate))) {
        throw exceptions.badRequest(`Invalid captureddate for image at index ${index}`);
      }

      const parsedOrder =
        img.orden === null || img.orden === undefined || img.orden === ''
          ? index + 1
          : Number(img.orden);

      if (!Number.isFinite(parsedOrder) || parsedOrder <= 0) {
        throw exceptions.badRequest(`Invalid orden for image at index ${index}`);
      }

      return {
        id: parsedImageId,
        orden: parsedOrder,
        captureddate: parsedCapturedDate,
        descripcion: typeof img.descripcion === 'string' ? img.descripcion.trim() : ''
      };
    });

    const result = await placesService.updateImagesMetadata(PlaceID, metadata);

    return res.success(
      'Image metadata updated successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

const placesController = {
    getPlaceByID,
    searchPlaces,
    searchPlacesByField,
    uploadImages,
    createPlace,
    updatePlace,
    updateFacilities,
    addFacilities,
    getNewPlaces,
    deleteImage,
    setCoverImage,
    updateImagesMetadata
};
export default placesController;