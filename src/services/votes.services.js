import VotesRepository  from "../repositories/votes.repository.js";
import { votesClient } from "../config/supabase.js";
const votesRepositoryInstance = new VotesRepository({ votesClient });

const votesService = {
  createVote: async (userId, voteData) => {
    /*const verifyVoteExists = await votesRepositoryInstance.verifyVoteExists(
      userId,
      voteData.tripid,
        voteData.placeid
    );

    if (verifyVoteExists.status === 200 && verifyVoteExists.data.exists) {
      return { status: 409, error: "Vote already exists" };
    }*/
    if (voteData.tripid && !voteData.placeid ) {
      return await votesRepositoryInstance.createVoteTrips(userId, voteData);
    } else if (voteData.tripid && voteData.placeid) {
      return await votesRepositoryInstance.createVoteItinerary(userId, voteData);
    } else if (!voteData.tripid && voteData.placeid) {
      return await votesRepositoryInstance.createVotePlace(userId, voteData);
    }
    
    return { status: 400, error: "Invalid vote data" };
  },

  updateVote: async (userId, voteData) => {
    const result = await votesRepositoryInstance.updateVote(userId, voteData);
    return result;
  }
};
export default votesService;
