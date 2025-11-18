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

const getNewsTrips = async (req, res) => {
  try{
    //get news trips
    const trips = await tripsService.getNewsTrips();
    if(trips.status != 200){
      return ApiError("new trips error", trips.status )
    }
    console.log("trips info: ",trips.data);
    
    //get owners info
    const ownerIds = trips.data.map(trip => trip.ownerid);
    const uniqueOwnerIds = [...new Set(ownerIds)];
    const ownersInfo = await usersService.searchOwnerInfo(uniqueOwnerIds, "id, name, tag, email");
    
    if(ownersInfo.status != 200){
      return ApiError("owners info error", ownersInfo.status )
    }
    console.log("Owners info:", ownersInfo.data);
    //get Intineraries
    const tripIds = trips.data.map(trip => trip.id);
    const itinerary = await tripsService.searchItineraryByTripIDs(tripIds);
    if(itinerary.status != 200){
      return ApiError("itinerary info error", itinerary.status )
    }
    console.log("Itinerary", itinerary.data);
    //get places info for itinerary
    const placeIds = itinerary.data.map(item => item.placeid);
    const uniquePlaceIds = [...new Set(placeIds)];
    const placesInfo = await placesService.searchPlacesByIDs(uniquePlaceIds, "id, name, countryid, stateid, cityid");
    
    if(placesInfo.status != 200){
      return ApiError("places info error", placesInfo.status )
    }
    console.log("places info", placesInfo.data);
    
    //get ubication names for itinerary
    const countriesIds = placesInfo.data.map(place => place.countryid);
    const statesIds = placesInfo.data.map(place => place.stateid);
    const citiesIds = placesInfo.data.map(place => place.cityid);

    const UbicationNames = await ubicationService.getUbicationNamesByIDs(
      [...new Set(countriesIds)], 
      [...new Set(statesIds)], 
      [...new Set(citiesIds)]
    );

    if(UbicationNames.status != 200){
      return ApiError("ubication names error", UbicationNames.status )
    }
    console.log("ubications", UbicationNames.data);
    //Map ubication names to itinerary
    itinerary.data.forEach(item => {
      const place = placesInfo.data.find(place => place.id === item.placeid);
      if (place) {
        const country = UbicationNames.data.countries.find(c => c.id === place.countryid);
        const state = UbicationNames.data.states.find(s => s.id === place.stateid);
        const city = UbicationNames.data.cities.find(ci => ci.id === place.cityid);
        item.Ubication = {
          country: country ? { id : country.id , name : country.name } : null,
          state: state ? { id : state.id ,name : state.name } : null,
          city: city ? { id: city.id, name : city.name} : null
        };
        item.place = {
          id: place.id,
          name: place.name
        };
      }
    });

    console.log(itinerary.data);

    //Generate response
    const itemsToReturn = trips.data.map(
            item => ({
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
                itinerary : itinerary.data.filter(it => it.tripid === item.id),
                owner : ownersInfo.data.find(owner => owner.id === item.ownerid)
            })
        );
        console.log(itemsToReturn);
    return new ApiResponse(res).success(
      'Reading news trips sucess', 
      itemsToReturn);
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
  getNewsTrips
};

export default tripsController;