import exceptions from '../middleware/exceptions.middleware.js';
import { getAuthenticatedUser, requireAuthenticatedUser } from '../utils/auth-user.js';
import tripsService from '../services/trips.service.js';
import TripModel from '../models/trip.model.js';

const validateTripAdminOrCreator = async (req, tripId) => {
  const { userId, isAdmin } = requireAuthenticatedUser(req);

  if (isAdmin) {
    return userId;
  }

  const trip = await tripsService.getTripById(tripId, userId);

  if (Number(trip.owner?.id) !== Number(userId)) {
    throw exceptions.forbidden('Only admin or trip creator can perform this action');
  }

  return userId;
};

const validateTripMemberOrCreator = async (req, tripId) => {
  const { userId, isAdmin } = requireAuthenticatedUser(req);

  if (isAdmin) {
    return userId;
  }

  const trip = await tripsService.getTripById(tripId, userId);

  // Check if user is the trip owner
  if (Number(trip.owner?.id) === Number(userId)) {
    return userId;
  }

  // Check if user is a member of the trip
  const members = await tripsService.getMembersListByTripId(tripId);

  const isMember = members.some(member => Number(member.userid) === Number(userId));
  
  if (!isMember) {
    throw exceptions.forbidden('Only trip creator or members can perform this action');
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
      orden : validatedData.orden,
      ownerid : userId
    });
    
    res.success('Creation process sucess', data, 201);
  } catch(err){
    next(err);
  } 
};

const getTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);
    
    // Get optional fields parameter from query string
    const { fields } = req.query;
    const requestedFields = fields ? fields.split(',').map(f => f.trim()) : null;
    
    const { userId } = getAuthenticatedUser(req);
    const trip = await tripsService.getTripById(TripID, userId, requestedFields);
    
    res.success(
      'Reading process sucess', 
      trip);
  } catch (err) {
    next(err);
  }
};

const updateTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripAdminOrCreator(req, TripID);

    // Validate request body
    const validatedData = TripModel.forUpdate(req.body);

    await tripsService.updateTrip(TripID, {
        name : validatedData.name, 
        description : validatedData.description, 
        initialdate : validatedData.initialdate,
      finaldate : validatedData.finaldate,
      orden : validatedData.orden,
        lastupdateddate : new Date().toISOString()
    });

    res.success(
      'Updating Data sucess');

  } catch (err) {
    next(err);
  }
};

const deleteTripbyID = async (req, res, next) => {
  try {
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripAdminOrCreator(req, TripID);

    const resp = await tripsService.deleteTrip(TripID);

    res.success(
      'Deletin process sucess', 
      resp);
  } catch (err) {
    next(err);
  }
};

const getTripsByOwner = async (req, res, next) => {
  try {
    const { UserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action || null;
    const placeIdsParam = req.query.placeids || req.query.list || req.query.placeid || null;
    const placeIds = placeIdsParam ? String(placeIdsParam).split(',').map(value => value.trim()).filter(Boolean) : [];

    if (action === 'additinerary' && placeIds.length === 0) {
      throw exceptions.badRequest('placeid/placeids is required when action=additinerary');
    }

    const { data, pagination } = await tripsService.getTripsByOwner(UserId, page, limit, {
      action,
      placeIds
    });

    return res.success(
      'Reading trips by owner success',
      data,
      200,
      pagination
    );
  } catch (err) {
    next(err);
  }
};

//Get all countries
const getAllTrips = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try{
    const { data, pagination } = await tripsService.getAll({}, null, page, limit);

    return res.success(
      'Reading all trips sucess', 
      data,
      200,
      pagination);
  } catch(err){
    next(err);
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

    return res.success(
      'Reading news trips sucess', 
      trips);
  } catch(err){
    next(err);
  } 
};

const searchTrips = async (req, res, next) => {
  try{
    const { userId } = getAuthenticatedUser(req);
    //Get filters to search
    const filters = req.body?.filters || {};
    
    // Get pagination parameters from query string
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    
    //call search
    const { data, pagination } = await tripsService.searchTrips(filters, userId, page, limit);
    
    return res.success(
      'Search trips sucess', 
      data || [],
      200,
      pagination);
  } catch(err){
    next(err);
  }
};

const createItinerary = async (req, res, next) => {
  try{
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripMemberOrCreator(req, TripID);
    //GetrqBody
    const { Itinerary } = req.body;
    const data = await tripsService.createItinerary(TripID, Itinerary);
    res.success('Itinerary creation process sucess', 
      data, 
      201);
  } catch(err){
    next(err);
  }
};

const updateItinerary = async (req, res, next) => {
  try{
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripMemberOrCreator(req, TripID);

    //GetrqBody
    const { Itinerary } = req.body;
    const data = await tripsService.updateItinerary(TripID, Itinerary);
    
    res.success('Itinerary update process sucess', data, 201);
  }
  catch(err){
    next(err);
  }
};

const addItineraryPlace = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripMemberOrCreator(req, TripID);

    const validatedData = TripModel.forItineraryPlace(req.body);

    const data = await tripsService.addItineraryPlace(TripID, {
      placeid: validatedData.placeid,
      initialdate: validatedData.initialdate,
      finaldate: validatedData.finaldate,
      orden: validatedData.orden
    });

    return res.success(
      'Itinerary place added process success',
      data,
      201
    );
  } catch (err) {
    next(err);
  }
};

const createMemberList = async (req, res, next) => {
  try{
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripAdminOrCreator(req, TripID);

    //GetrqBody
    const { Members } = req.body;

    const data = await tripsService.createMemberList(TripID, Members);
    res.success('Member list creation process sucess', data, 201);
  } catch(err){
    next(err);
  }
};

const updateMemberList = async (req, res, next) => {
  try{
    //Get trip id to search
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripAdminOrCreator(req, TripID);

    //GetrqBody
    const { Members } = req.body;
    
    await tripsService.updateMemberList(TripID, Members);
    res.success('Member list update process sucess');
  }
  catch(err){
    next(err);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripMemberOrCreator(req, TripID);
    
    // Validate request has images
    if (!req.body.images || !Array.isArray(req.body.images)) {
      throw exceptions.badRequest('Images array is required in request body');
    }

    // Convert base64 images to buffer format
    const images = req.body.images.map((img, index) => {
      if (!img.data) {
        throw exceptions.badRequest(`Image data is required for image at index ${index}`);
      }

      const parsedPlaceId =
        img.placeid === null || img.placeid === undefined || img.placeid === ''
          ? null
          : Number(img.placeid);

      if (parsedPlaceId !== null && Number.isNaN(parsedPlaceId)) {
        throw exceptions.badRequest(`Invalid placeid for image at index ${index}`);
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
        extension: img.extension || 'jpg',
        orden: parsedOrder,
        iscover: Boolean(img.iscover),
        placeid: parsedPlaceId,
        captureddate: parsedCapturedDate,
        descripcion: typeof img.descripcion === 'string' ? img.descripcion.trim() : ''
      };
    });

    const data = await tripsService.uploadImages(TripID, images);

    res.success(
      'Images uploaded successfully',
      data,
      201
    );
  } catch (err) {
    next(err);
  }
};

const updateImagesMetadata = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);

    await validateTripMemberOrCreator(req, TripID);

    if (!req.body.images || !Array.isArray(req.body.images)) {
      throw exceptions.badRequest('Images array is required in request body');
    }

    const metadata = req.body.images.map((img, index) => {
      const parsedImageId = Number(img.id);
      if (!Number.isFinite(parsedImageId) || parsedImageId <= 0) {
        throw exceptions.badRequest(`Invalid image id at index ${index}`);
      }

      const parsedPlaceId =
        img.placeid === null || img.placeid === undefined || img.placeid === ''
          ? null
          : Number(img.placeid);

      if (parsedPlaceId !== null && Number.isNaN(parsedPlaceId)) {
        throw exceptions.badRequest(`Invalid placeid for image at index ${index}`);
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
        placeid: parsedPlaceId,
        captureddate: parsedCapturedDate,
        descripcion: typeof img.descripcion === 'string' ? img.descripcion.trim() : ''
      };
    });

    const data = await tripsService.updateImagesMetadata(TripID, metadata);

    return res.success(
      'Image metadata updated successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);
    const ImageID = TripModel.validateImageId(req.params.ImageID);

    await validateTripMemberOrCreator(req, TripID);
    
    const data = await tripsService.deleteImage(TripID, ImageID);
    
    return res.success(
      'Image deleted successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

const setCoverImage = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);
    const ImageID = TripModel.validateImageId(req.params.ImageID);

    await validateTripMemberOrCreator(req, TripID);
    
    const data = await tripsService.setCoverImage(TripID, ImageID);
    
    return res.success(
      'Cover image set successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);
    const validateRequest = TripModel.forCreateComment(req.body);
    const commentData = validateRequest;

    await validateTripMemberOrCreator(req, TripID);

    await tripsService.saveComment(TripID, commentData);

    return res.successNoData(201);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const CommentID = TripModel.validateId(req.params.CommentID);
    const validateRequest = TripModel.forUpdateComment(req.body);
    const commentData = validateRequest;

    await validateTripMemberOrCreator(req, CommentID);

    await tripsService.updateComment(CommentID, commentData);

    return res.successNoData(200);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const CommentID = req.params.CommentID;

    await validateTripMemberOrCreator(req, CommentID);

    await tripsService.deleteComment(CommentID);

    return res.successNoData(200);
  } catch (error) {
    next(error);
  }
};

const getCommentsByTripId = async (req, res, next) => {
  try {
    const TripID = TripModel.validateId(req.params.TripID);

    const data = await tripsService.getCommentsByTripId(TripID);

    return res.success(
      'Comments retrieved successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

const tripsController = {
  createTrip,
  getTripbyID,
  getTripsByOwner,
  updateTripbyID,
  deleteTripbyID,
  getAllTrips,
  getNewTrips,
  searchTrips,
  createItinerary,
  updateItinerary,
  addItineraryPlace,
  createMemberList,
  updateMemberList,
  uploadImages,
  updateImagesMetadata,
  deleteImage,
  setCoverImage,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByTripId
};

export default tripsController;