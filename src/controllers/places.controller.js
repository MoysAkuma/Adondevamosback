import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
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
    
    if (place.status != 200) throw new ApiError(place.status, place.message);
    
    if (!place.data) throw new ApiError(404, 'Place not found');
    
    return new ApiResponse(res).success(
      'Reading process sucess', 
      place.data ? place.data : {});
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  }
};

/**
 * 
 */
const searchPlaces = async (req, res, next) => {
  try {
    //Get filters
    const { filters } = req.body;
    const foundedPlaces = await placesService.searchPlaces(filters);
    if (!foundedPlaces.data) throw new ApiError(foundedPlaces.status, foundedPlaces.message || 'No results to show');
    
    return new ApiResponse(res).success(
      'Reading process sucess', 
      foundedPlaces.data ? foundedPlaces.data : {});

  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  }
};

const searchPlacesByField = async (req, res, next) => {
  try {
    //Get name filter
    const { field, name } = req.params;
    
    const foundedPlaces = await placesService.searchPlacesByField(field, name);

    if (foundedPlaces.status != 200) throw new ApiError(foundedPlaces.status, foundedPlaces.message);

    return new ApiResponse(res).success(
      'Reading process sucess', 
      foundedPlaces.data ? foundedPlaces.data : {});
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  }
};

const uploadImages = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;
    
    const images = req.body.images.map((img, index) => {
      if (!img.data) {
        throw new ApiError(400, `Image data is required for image at index ${index}`);
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
      throw new ApiError(400, 'No images provided for upload');
    }

    const uploadResult = await placesService.uploadImages(PlaceID, images);

    if (uploadResult.status !== 200) {
      throw new ApiError(uploadResult.status, uploadResult.error || 'Image upload failed');
    }
    return new ApiResponse(res).success(
      'Images uploaded successfully',
      uploadResult.data
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
      throw new ApiError(400, errorMessages);
    }
    const placeData = validation.data;
    const createResult = await placesService.createPlace(placeData);

    if (createResult.status !== 201) {
      throw new ApiError(createResult.status, createResult.error || 'Place creation failed');
    }
    return new ApiResponse(res).success(
      'Place created successfully',
      createResult.data,
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
      throw new ApiError(400, errorMessages);
    }
    const placeData = validation.data;

    const updateResult = await placesService.updatePlace(PlaceID, placeData);
    if (updateResult.status !== 200) {
      throw new ApiError(updateResult.status, updateResult.error || 'Place update failed');
    }
    return new ApiResponse(res).success(
      'Place updated successfully',
      updateResult.data
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
      throw new ApiError(400, 'Facilities data must be an array');
    }
    const updateResult = await placesService.updateFacilities(PlaceID, Facilities);
    if (updateResult.status !== 200) {
      throw new ApiError(updateResult.status, updateResult.error || 'Facilities update failed');
    }
    return new ApiResponse(res).success(
      'Facilities updated successfully',
      updateResult.data
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
      throw new ApiError(400, 'Facilities data must be an array');
    }
    const addResult = await placesService.addFacilities(PlaceID, Facilities);
    if (addResult.status !== 200) {
      throw new ApiError(addResult.status, addResult.error || 'Add facility failed');
    }
    return new ApiResponse(res).success(
      'Facility added successfully',
      addResult.data
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
    if(places.status != 200){
      throw new ApiError(places.status, places.message )
    }
    return new ApiResponse(res).success(
      'Reading news places sucess', 
      places.data);
  } catch(err){
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { PlaceID, ImageID } = req.params;
    
    if (!ImageID) {
      throw new ApiError(400, 'Image ID is required');
    }
    
    const deleteResult = await placesService.deleteImage(PlaceID, ImageID);
    
    if (deleteResult.status !== 200) {
      throw new ApiError(deleteResult.status, deleteResult.error || 'Image deletion failed');
    }
    
    return new ApiResponse(res).success(
      'Image deleted successfully',
      deleteResult.data
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
    deleteImage
};
export default placesController;