import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import tripsService from '../services/trips.service.js';
import placesService from '../services/places.service.js';
import ubicationService from '../services/ubication.service.js';
import usersService from '../services/users.service.js';

//create trip
const createTrip = async (req, res, next) => {
  try{
    //GetrqBody
    const { name, ownerid, description, 
            initialdate, finaldate } = req.body;
    const data = await tripsService.createCountry({
        name : name, 
        description : description, 
        initialdate : initialdate ,
        finaldate : finaldate,
        ownerid : ownerid,
        hide : false
    });
    
    if (data.status != 201) throw new ApiError(500, error.message);
      new ApiResponse(res).success('Creation process sucess', data.data, data.status);
  } catch(err){
    next(err);
  } 
};

const getTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const { TripID } = req.params;
    const trip = await tripsService.getTripById(TripID);

    if (trip.status == 500) throw new ApiError(500, trip.message);
    if (trip.data.length === 0) throw new ApiError(404, 'Trip not found');
    
    new ApiResponse(res).success(
      'Reading process sucess', 
      trip.data);
  } catch (err) {
    next(err);
  }
};


const updateTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const { TripID } = req.params;

    //GetrqBody
    const { name, description, 
            initialdate, finaldate } = req.body;

    const editedtrip = await tripsService.updateTrip(TripID, {
        name : name, 
        description : description, 
        initialdate : initialdate ,
        finaldate : finaldate,
        ownerid : req.user.id,
        lastupdateddate : new Date().toISOString()
    });

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Updating Data sucess', 
      editedtrip.data);

  } catch (err) {
    next(err);
  }
};

const deleteTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const { TripID } = req.params;
    const resp = await tripsService.deleteTrip(TripID);

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Deletin process sucess', 
      resp.data);
  } catch (err) {
    next(err);
  }
};

//Get all countries
const getAllTrips = async (req, res) => {
  const page = parseInt(req.query.page) || 10;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try{
    const trips = await tripsService.getAll();

    if(trips.status != 200){
      return ApiError(trips.message, trips.status )
    }
    return new ApiResponse(res).success(
      'Reading all trips sucess', 
      trips.data);
  } catch(err){
    return new ApiError(err.message, err.status);
  }   
};

const getNewTrips = async (req, res) => {
  try{
    //get news trips
    const trips = await tripsService.getNewsTrips();
    if(trips.status != 200){
      return ApiError("new trips error", trips.status )
    }
    
    //get owners info
    const ownerIds = trips.data.map(trip => trip.ownerid);
    const ownersInfo = await usersService.searchOwnerInfo(ownerIds, "id, name, tag, email");
    
    if(ownersInfo.status != 200){
      return ApiError("owners info error", ownersInfo.status )
    }
   
    //get Intineraries
    const tripIds = trips.data.map(trip => trip.id);
    const itinerary = await tripsService.searchItineraryByTripIDs(tripIds);
    if(itinerary.status != 200){
      return ApiError("itinerary info error", itinerary.status )
    }
   
    //get places info for itinerary
    const placeIds = itinerary.data.map(item => item.placeid);
    const placesInfo = await placesService.searchPlacesByIDs(placeIds, "id, name, countryid, stateid, cityid");
    
    if( placesInfo.status != 200 ){
      return ApiError("places info error", placesInfo.status )
    }

    const UbicationNames = 
    await ubicationService.getUbicationNamesByIDs(
      placesInfo.data
    );

    if(UbicationNames.status != 200){
      return ApiError("ubication names error", UbicationNames.status )
    }
    
    const matchPlacesWithUbicationIds = matchUbicationNames(placesInfo, UbicationNames);

    //Generate response
    const itemsToReturn = trips.data.map(
      item => 
        (
          {
            id : item.id, 
            name : item.name, 
            description : item.description, 
            initialdate : item.initialdate, 
            finaldate : item.finaldate, 
            isinternational : item.isinternational,
            statics : {
               Votes : {
                Total: 0
                }
            },
            itinerary : itinerary.data.filter(
              it => it.tripid === item.id
            ).map(
                retItinerary => (
                  {
                    initialdate : retItinerary.initialdate,
                    finaldate : retItinerary.finaldate,
                    place : matchPlacesWithUbicationIds.data.find(
                      place => place.id === retItinerary.placeid
                    ),
                    Ubication : retItinerary.Ubication
                  }
                )
            ),
            owner : ownersInfo.data.find(owner => owner.id === item.ownerid)
          }
        )
      );
  
    return new ApiResponse(res).success(
      'Reading news trips sucess', 
      itemsToReturn);
  } catch(err){
    return new ApiError(err.message, err.status);
  } 
};

const searchTrips = async (req, res) => {
  try{
    //Get filters to search
    const { filters } = req.body;
    
    //call search
    const foundedTrips = await tripsService.searchTrips(filters);
    
    if (foundedTrips.status != 200 ) {
      return ApiError(foundedTrips.message, foundedTrips.status )
    }
    
    return new ApiResponse(res).success(
      'Search trips sucess', 
      foundedTrips.data);
  } catch(err){
    return new ApiError(err.message, err.status);
  }
};



const tripsController = {
  createTrip,
  getTripbyID,
  updateTripbyID,
  deleteTripbyID,
  getAllTrips,
  getNewTrips,
  searchTrips
};

export default tripsController;