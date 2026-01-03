import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
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

export {
  getVotesByPlace,
  getVotesByTrip
};
