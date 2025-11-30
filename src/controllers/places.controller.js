import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import placesService from '../services/places.service.js';
import ubicationService from '../services/ubication.service.js';

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
    
    if (foundedPlaces.status == 500) return new ApiError(500, places.message);
    
    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(foundedPlaces.data);
    if (ubicationNames.status == 500) return new ApiError(500, ubicationNames.message);
    
    //map names to places
    const placesWithUbicationNames = matchUbicationNames(foundedPlaces, ubicationNames);

    return new ApiResponse(res).success(
      'Reading process sucess', 
      placesWithUbicationNames[0] ? placesWithUbicationNames : {});

  } catch (err) {
    return new ApiError(err.message, err.status);
  }
};

const matchUbicationNames = (places, ubicationNames) => {
 return places.data.map( place => {
      //find country name
        const country = ubicationNames.data.countries.find( c => c.id === place.countryid);
        const state = ubicationNames.data.states.find( s => s.id === place.stateid);
        const city = ubicationNames.data.cities.find( ci => ci.id === place.cityid);
        return {
            id: place.id,
            name: place.name,
            address: place.address,
            description: place.description,
            ispublic: place.ispublic,
            Country: country ? 
            { 
                id: country.id, 
                name : country.name, 
                acronym : country.acronym
            } : null,
            State: state ? 
            { 
                id: state.id,
                name : state.name
            } : null,
            City: city ?
            { 
                id: city.id,
                name : city.name
            } : null
        };
    });
}

const placesController = {
    getPlaceByID,
    searchPlaces
};
export default placesController;