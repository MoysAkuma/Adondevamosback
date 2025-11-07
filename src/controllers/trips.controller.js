import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import tripsService from '../services/trips.service.js';

//create trip
const createTrips = async (req, res, next) => {
  try{
    //GetrqBody
    const { name, description, 
            initialdate, finaldate } = req.body;
    const data = await tripsService.createCountry({
        name : name, 
        description : description, 
        initialdate : initialdate ,
        finaldate : finaldate,
        ownerid : req.user.id,
        hide : false
    });
    
    if (data.status != 201) throw new ApiError(500, error.message);
      new ApiResponse(res).success('Creation process sucess', data, data.status);
  } catch(err){
    next(err);
  } 
};

const getTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const { TripID } = req.params;
    const trip = tripsService.getTripById(TripID);
    
    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Reading process sucess', 
      trip);
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
      editedtrip);

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
      resp);
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
    const trips = await tripsService.getAll(page, limit, skip);

    if(countries.status != 200){
      return ApiError(countries.message, countries.status )
    }
    return new ApiResponse(res).success(
      'Reading all trips sucess', 
      trips.data);
  } catch(err){
    return new ApiError(err.message, err.status);
  }   
};

const tripsController = {
  createTrips,
  getTripbyID,
  updateTripbyID,
  deleteTripbyID,
  getAllTrips
};

export default tripsController;