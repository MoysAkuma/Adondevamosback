import VotesRepository  from "../repositories/votes.repository.js";
import { votesClient } from "../config/supabase.js";
const votesRepositoryInstance = new VotesRepository({ votesClient });

const votesService = {
  createVote: async (userId, voteData) => {
    if (voteData.tripid && 
      !voteData.placeid ) {
      //valida if vote exists and change or create
      const userVotedTrip = await 
      votesRepositoryInstance.getUserVoteByTripIdAndUserId(voteData.tripid, 
        userId);
      switch (userVotedTrip.status) {
        case 500:
          return userVotedTrip;
          break;
        case 200:
          //update vote
          return await votesRepositoryInstance.updateVoteTrips(
            userId, 
            !userVotedTrip.data.value,
            voteData.tripid );
          break;
        case 404:
          return await votesRepositoryInstance.createVoteTrips(
            userId, 
            voteData);
          break;
      }
      
    } else if (voteData.tripid && voteData.placeid) {
      //vote itinerary
      const userVotedItinerary = await 
      votesRepositoryInstance.getUserVoteByItineraryTripIdPlaceIdAndUserId(
        voteData.tripid, voteData.placeid, userId);
      switch (userVotedItinerary.status) {
        case 500:
          return userVotedItinerary;
          break;
        case 200:
          //update vote
          return await votesRepositoryInstance.updateVoteItinerary(
            userId, 
            !userVotedItinerary.data[0].value,
            voteData.tripid,
            voteData.placeid );
          break;
        case 404:
          return await votesRepositoryInstance.createVoteItinerary(
            userId, 
            voteData);
          break;
      }
    } else if (!voteData.tripid && voteData.placeid) {
      const userVotedPlace = await 
      votesRepositoryInstance.getUserVoteByPlaceIdAndUserId(
        voteData.placeid, userId);

      switch (userVotedPlace.status) {
        case 500:
          return userVotedPlace;
          break;
        case 200:
          //update vote
          return await votesRepositoryInstance.updateVotePlace(
            userId, 
            !userVotedPlace.data[0].value,
            voteData.placeid );
          break;
        case 404:
          return await votesRepositoryInstance.createVotePlace(
            userId, 
            voteData);
          break;
      }
    }
    
    return { status: 400, error: "Invalid vote data" };
  },

  updateVote: async (userId, voteData) => {
    const result = await votesRepositoryInstance.updateVote(userId, voteData);
    return result;
  }
};
export default votesService;
