import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import { getAuthenticatedUser, requireAuthenticatedUser } from '../utils/auth-user.js';
import tripsService from '../services/trips.service.js';
import TripModel from '../models/trip.model.js';

const validateTripAdminOrCreator = async (req, tripId) => {
  const { userId, isAdmin } = requireAuthenticatedUser(req);

  if (isAdmin) {
    return userId;
  }

  const trip = await tripsService.getTripById(tripId, userId);

  if (trip.status == 500) throw new ApiError(500, trip.message);
  if (!trip.data) throw new ApiError(404, 'Trip not found');

  if (Number(trip.data.owner?.id) !== Number(userId)) {
    throw new ApiError(403, 'Only admin or trip creator can perform this action');
  }

  return userId;
};

const validateTripMemberOrCreator = async (req, tripId) => {
  const { userId, isAdmin } = requireAuthenticatedUser(req);

  if (isAdmin) {
    return userId;
  }

  const trip = await tripsService.getTripById(tripId, userId);

  if (trip.status == 500) throw new ApiError(500, trip.message);
  if (!trip.data) throw new ApiError(404, 'Trip not found');

  // Check if user is the trip owner
  if (Number(trip.data.owner?.id) === Number(userId)) {
    return userId;
  }

  // Check if user is a member of the trip
  const members = await tripsService.getMembersListByTripId(tripId);
  if (members.status !== 200) throw new ApiError(500, members.message);

  const isMember = members.data.some(member => Number(member.userid) === Number(userId));
  
  if (!isMember) {
    throw new ApiError(403, 'Only trip creator or members can perform this action');
  }

  return userId;
};

//create trip
const createTrip = async (req, res, next) => {
  try{
    const { userId } = requireAuthenticatedUser(req);

    // Validate request body
    const validatedData = TripModel.forCreate(req.body);
            
    const data = await tripsService.createTrip({
        name : validatedData.name, 
        description : validatedData.description, 
        initialdate : validatedData.initialdate,
        finaldate : validatedData.finaldate,
        ownerid : userId
    });
    
    if (data.status != 201) throw new ApiError(500, data.message);
      new ApiResponse(res).success('Creation process sucess', 
        data.data, 
        data.status);
  } catch(err){
    next(err);
  } 
};

const getTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const { TripID } = req.params;
    
    // Get optional fields parameter from query string
    const { fields } = req.query;
    const requestedFields = fields ? fields.split(',').map(f => f.trim()) : null;
    
    const { userId } = getAuthenticatedUser(req);
    const trip = await tripsService.getTripById(TripID, userId, requestedFields);
    
    if (trip.status == 500) throw new ApiError(500, trip.message);
    
    if (!trip.data) throw new ApiError(404, 'Trip not found');
    
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

    await validateTripAdminOrCreator(req, TripID);

    // Validate request body
    const validatedData = TripModel.forUpdate(req.body);

    const editedtrip = await tripsService.updateTrip(TripID, {
        name : validatedData.name, 
        description : validatedData.description, 
        initialdate : validatedData.initialdate,
        finaldate : validatedData.finaldate,
        lastupdateddate : new Date().toISOString()
    });

    if (editedtrip.status == 500) throw new ApiError(500, editedtrip.message);
    
    new ApiResponse(res).success(
      'Updating Data sucess');

  } catch (err) {
    next(err);
  }
};

const deleteTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const { TripID } = req.params;

    await validateTripAdminOrCreator(req, TripID);

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
const getAllTrips = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try{
    const trips = await tripsService.getAll({}, null, page, limit);

    if(trips.status != 200){
      throw new ApiError(trips.status, trips.message);
    }
    return new ApiResponse(res).success(
      'Reading all trips sucess', 
      trips.data,
      200,
      trips.pagination);
  } catch(err){
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  }   
};

const getNewTrips = async (req, res, next) => {
  try{
    //get limit from params
    const { Limit } = req.params;
    
    // Get optional fields parameter from query string
    const { fields } = req.query;
    const requestedFields = fields ? fields.split(',').map(f => f.trim()) : null;
    
    const { userId } = getAuthenticatedUser(req);
    const parsedLimit = Number(Limit) || 5;

    //get news trips
    const trips = await tripsService.getNewsTrips(parsedLimit, userId, requestedFields);
    if(trips.status != 200){
      throw new ApiError(trips.status, "new trips error");
    }

    return new ApiResponse(res).success(
      'Reading news trips sucess', 
      trips.data);
  } catch(err){
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  } 
};

const searchTrips = async (req, res, next) => {
  try{
    const { userId } = getAuthenticatedUser(req);
    //Get filters to search
    const { filters } = req.body;
    
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    //call search
    const foundedTrips = await tripsService.searchTrips(filters, userId, page, limit);
    if (!foundedTrips.data) throw new ApiError(404, 
      foundedTrips.message || 'No results to show');
    
    return new ApiResponse(res).success(
      'Search trips sucess', 
      foundedTrips.data,
      200,
      foundedTrips.pagination);
  } catch(err){
    next(err instanceof ApiError ? err : new ApiError(err.status || 500, err.message));
  }
};

const createItinerary = async (req, res, next) => {
  try{
    //Get trip id to search
    const { TripID } = req.params;

    await validateTripAdminOrCreator(req, TripID);
    //GetrqBody
    const { Itinerary } = req.body;
    const data = await tripsService.createItinerary(TripID, Itinerary);
    if (data.status != 201) throw new ApiError(500, "Failed to create itinerary");
      new ApiResponse(res).success('Itinerary creation process sucess', 
        data.data, 
        data.status);
  } catch(err){
    next(err);
  }
};

const updateItinerary = async (req, res, next) => {
  try{
    //Get trip id to search
    const { TripID } = req.params;

    await validateTripMemberOrCreator(req, TripID);

    //GetrqBody
    const { Itinerary } = req.body;
    const data = await tripsService.updateItinerary(TripID, Itinerary);
    
    if (data.status != 201) throw new ApiError(data.status, "Failed to update itinerary");
      new ApiResponse(res).success('Itinerary update process sucess', data.data, data.status);
  }
  catch(err){
    next(err);
  }
};

const createMemberList = async (req, res, next) => {
  try{
    //Get trip id to search
    const { TripID } = req.params;

    await validateTripAdminOrCreator(req, TripID);

    //GetrqBody
    const { Members } = req.body;

    const data = await tripsService.createMemberList(TripID, Members);
    if (data.status != 201) throw new ApiError(500, "Failed to create member list");
      new ApiResponse(res).success('Member list creation process sucess', data.data, data.status);
  } catch(err){
    next(err);
  }
};

const updateMemberList = async (req, res, next) => {
  try{
    //Get trip id to search
    const { TripID } = req.params;

    await validateTripAdminOrCreator(req, TripID);

    //GetrqBody
    const { Members } = req.body;
    
    const data = await tripsService.updateMemberList(TripID, Members);
    if (data.status != 201) throw new ApiError(500, 
      "Failed to update member list");
      new ApiResponse(res).success('Member list update process sucess');
  }
  catch(err){
    next(err);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    const { TripID } = req.params;

    await validateTripAdminOrCreator(req, TripID);
    
    // Validate request has images
    if (!req.body.images || !Array.isArray(req.body.images)) {
      throw new ApiError(400, 'Images array is required in request body');
    }

    // Convert base64 images to buffer format
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

    const result = await tripsService.uploadImages(TripID, images);

    if (result.status !== 200) {
      throw new ApiError(result.status, result.error);
    }

    new ApiResponse(res).success(
      'Images uploaded successfully',
      result.data,
      201
    );
  } catch (err) {
    next(err);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { TripID, ImageID } = req.params;

    await validateTripAdminOrCreator(req, TripID);
    
    if (!ImageID) {
      throw new ApiError(400, 'Image ID is required');
    }
    
    const deleteResult = await tripsService.deleteImage(TripID, ImageID);
    
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

const setCoverImage = async (req, res, next) => {
  try {
    const { TripID, ImageID } = req.params;

    await validateTripAdminOrCreator(req, TripID);
    
    if (!ImageID) {
      throw new ApiError(400, 'Image ID is required');
    }
    
    const result = await tripsService.setCoverImage(TripID, ImageID);
    
    if (result.status !== 200) {
      throw new ApiError(result.status, result.error || 'Failed to set cover image');
    }
    
    return new ApiResponse(res).success(
      'Cover image set successfully',
      result.data
    );
  } catch (error) {
    next(error);
  }
};

const tripsController = {
  createTrip,
  getTripbyID,
  updateTripbyID,
  deleteTripbyID,
  getAllTrips,
  getNewTrips,
  searchTrips,
  createItinerary,
  updateItinerary,
  createMemberList,
  updateMemberList,
  uploadImages,
  deleteImage,
  setCoverImage
};

export default tripsController;