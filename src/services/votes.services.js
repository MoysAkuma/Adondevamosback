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
          let info = userVotedTrip.data;
          return await votesRepositoryInstance.updateVoteTrips(
            userId, 
            !info.value,
            voteData.tripid,
            info.id );
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
          let info = userVotedItinerary.data;
          //update vote
          return await votesRepositoryInstance.updateVoteItinerary(
            userId, 
            !info.value,
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
          let info = userVotedPlace.data;
          //update vote
          return await votesRepositoryInstance.updateVotePlace(
            userId, 
            !info.value,
            voteData.placeid, 
            info.id );
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
  },
  getVotesByTrip: async (tripId) => {
    const result = await votesRepositoryInstance.getVotesByTripId(tripId);
    
    return {
      status: 200 ,
      data: {
      summary : result.data.length > 0 ? result.data.length : 0
    }};
  },
  getVotesByPlace: async (placeId) => {
    const result = await votesRepositoryInstance.getVotesByPlaceId(placeId);
    return {
      status: 200 ,
      data: {
      summary : result.data.length > 0 ? result.data.length : 0
    }};
  } 
};
export default votesService;
