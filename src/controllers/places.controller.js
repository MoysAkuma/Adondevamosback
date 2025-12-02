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

    const place = await placesService.getPlaceById(PlaceID);
    
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

const placesController = {
    getPlaceByID,
    searchPlaces
};
export default placesController;