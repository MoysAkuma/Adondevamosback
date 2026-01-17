import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import placesService from '../services/places.service.js';
import ubicationService from '../services/ubication.service.js';
import { mapPlacesWithUbicationNames } from '../mappers/ubication.mapper.js';
/**
 *  Recibes PlaceID as param and returns place info
 */
const getPlaceByID = async (req, res, next) => {
  try {
    //Get place id to search
    const { PlaceID } = req.params;

    //Get userid from header
    const userid = req.headers.userid || req.headers['user-id'];

    const place = await placesService.getPlaceById(PlaceID, userid);
    
    if (place.status != 200) return new ApiError(place.status, place.message);
    
    if (!place.data) return new ApiError(404, 'Place not found');
    
    return new ApiResponse(res).success(
      'Reading process sucess', 
      place.data ? place.data : {});
  } catch (err) {
    return new ApiError(err.message, err.status);
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
    
    if (foundedPlaces.status != 200) return new ApiError(foundedPlaces.status, foundedPlaces.message);
    
    return new ApiResponse(res).success(
      'Reading process sucess', 
      foundedPlaces.data ? foundedPlaces.data : {});

  } catch (err) {
    return new ApiError(err.message, err.status);
  }
};

const searchPlacesByField = async (req, res, next) => {
  try {
    //Get name filter
    const { field, name } = req.params;
    
    const foundedPlaces = await placesService.searchPlacesByField(field, name);

    if (foundedPlaces.status != 200) return new ApiError(foundedPlaces.status, foundedPlaces.message);

    return new ApiResponse(res).success(
      'Reading process sucess', 
      foundedPlaces.data ? foundedPlaces.data : {});
  } catch (err) {
    return new ApiError(err.message, err.status);
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
      return new ApiError(400, 'No images provided for upload');
    }

    const uploadResult = await placesService.uploadImages(PlaceID, images);

    if (uploadResult.status !== 200) {
      return new ApiError(uploadResult.status, uploadResult.error || 'Image upload failed');
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
    const placeData = req.body;
    const createResult = await placesService.createPlace(placeData);

    if (createResult.status !== 201) {
      return new ApiError(createResult.status, createResult.error || 'Place creation failed');
    }
    return new ApiResponse(res).success(
      'Place created successfully',
      createResult.data
    );
  } catch (error) {
    next(error);
  } 
};

const updatePlace = async (req, res, next) => {
  try {
    const { PlaceID } = req.params;
    const placeData = req.body;
    const updateResult = await placesService.updatePlace(PlaceID, placeData);
    if (updateResult.status !== 200) {
      return new ApiError(updateResult.status, updateResult.error || 'Place update failed');
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
    const facilitiesData = req.body.Facilities;
    if (!Array.isArray(facilitiesData)) {
      return new ApiError(400, 'Facilities data must be an array');
    }
    const updateResult = await placesService.updateFacilities(PlaceID, facilitiesData);
    if (updateResult.status !== 200) {
      return new ApiError(updateResult.status, updateResult.error || 'Facilities update failed');
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
    const facilityData = req.body;
    const addResult = await placesService.addFacility(PlaceID, facilityData);
    if (addResult.status !== 200) {
      return new ApiError(addResult.status, addResult.error || 'Add facility failed');
    }
    return new ApiResponse(res).success(
      'Facility added successfully',
      addResult.data
    );
  }
  catch (error) {
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
    addFacilities
};
export default placesController;