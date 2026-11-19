import exceptions from '../middleware/exceptions.middleware.js';
import { requireAuthenticatedUser } from '../utils/auth-user.js';
import votesService from "../services/votes.services.js";

const validateTokenUserMatch = (req, userIdFromParams) => {
  const { userId: tokenUserId } = requireAuthenticatedUser(req);

  if (Number(tokenUserId) !== Number(userIdFromParams)) {
    throw exceptions.forbidden('Token user does not match requested user');
  }

  return tokenUserId;
};

const getVotesByPlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const votes = await votesService.getVotesByPlace(placeId);

    res.success("Votes retrieved successfully", votes);
  } catch (err) {
    next(err);
  }
};

const getVotesByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const votes = await votesService.getVotesByTrip(tripId);
    res.success("Votes retrieved successfully", votes);
  } catch (err) {
    next(err);
  } 
};

const createVote = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const voteData = req.body;
    
    if(userid === undefined || userid === null) {
      throw exceptions.badRequest("User ID is required");
    }

    if (!voteData) {
      throw exceptions.badRequest("Vote data is required");
    }

    validateTokenUserMatch(req, userid);

    const newVote = await votesService.createVote(userid, voteData);
    res.success("Vote created successfully", newVote);
  } catch (err) {
    next(err);
  }
};

const updateVote = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const voteData = req.body;

    if(userid === undefined || userid === null) {
      throw exceptions.badRequest("User ID is required");
    }

    if (!voteData) {
      throw exceptions.badRequest("Vote data is required");
    }

    validateTokenUserMatch(req, userid);

    const updatedVote = await votesService.updateVote(userid, voteData);
    res.success("Vote updated successfully", updatedVote);
  } catch (err) {
    next(err);
  }
};

export default {
  getVotesByPlace,
  getVotesByTrip,
  createVote,
  updateVote
};
