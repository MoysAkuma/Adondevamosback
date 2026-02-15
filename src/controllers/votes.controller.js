import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import votesService from "../services/votes.services.js";

const getVotesByPlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const votes = await votesService.getVotesByPlace(placeId);

    if (votes.status === 500) throw new ApiError(500, votes.error);
    new ApiResponse(res).success("Votes retrieved successfully", votes.data);
  } catch (err) {
    next(err);
  }
};

const getVotesByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const votes = await votesService.getVotesByTrip(tripId);
    if (votes.status === 500) throw new ApiError(500, votes.error);
    new ApiResponse(res).success("Votes retrieved successfully", votes.data);
  } catch (err) {
    next(err);
  } 
};

const createVote = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const voteData = req.body;
    
    if(userid === undefined || userid === null) {
      throw new ApiError(400, "User ID is required");
    }

    if (!voteData) {
      throw new ApiError(400, "Vote data is required");
    }

    const newVote = await votesService.createVote(userid, voteData);
    if (newVote.status === 500) throw new ApiError(500, newVote.error);
    new ApiResponse(res).success("Vote created successfully", newVote.data);
  } catch (err) {
    next(err);
  }
};

const updateVote = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const voteData = req.body;
    const updatedVote = await votesService.updateVote(userid, voteData);
    if (updatedVote.status === 500) throw new ApiError(500, updatedVote.error);
    new ApiResponse(res).success("Vote updated successfully", updatedVote.data);
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
