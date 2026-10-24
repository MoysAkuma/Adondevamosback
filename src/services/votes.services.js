import VotesRepository  from "../repositories/votes.repository.js";
import { votesClient, publicServiceClient } from "../config/supabase.js";
const votesRepositoryInstance = new VotesRepository({ votesClient, rankingClient: publicServiceClient });

const refreshDailyVoteResults = async () => {
  const refreshResult = await votesRepositoryInstance.updateDailyVotesResults();
  if (refreshResult.status !== 200) {
    return refreshResult;
  }
  return null;
};

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
          const voteResult = await votesRepositoryInstance.updateVoteTrips(
            userId, 
            !info.value,
            voteData.tripid,
            info.id );

          if (voteResult.status !== 200) return voteResult;
          const refreshError = await refreshDailyVoteResults();
          if (refreshError) return refreshError;
          return voteResult;
          break;
        case 404:
          const createdTripVote = await votesRepositoryInstance.createVoteTrips(
            userId, 
            voteData);
          if (createdTripVote.status !== 201) return createdTripVote;
          const tripRefreshError = await refreshDailyVoteResults();
          if (tripRefreshError) return tripRefreshError;
          return createdTripVote;
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
          const itineraryVoteResult = await votesRepositoryInstance.updateVoteItinerary(
            userId, 
            !info.value,
            voteData.tripid,
            voteData.placeid );

          if (itineraryVoteResult.status !== 200) return itineraryVoteResult;
          const itineraryRefreshError = await refreshDailyVoteResults();
          if (itineraryRefreshError) return itineraryRefreshError;
          return itineraryVoteResult;
          break;
        case 404:
          const createdItineraryVote = await votesRepositoryInstance.createVoteItinerary(
            userId, 
            voteData);
          if (createdItineraryVote.status !== 201) return createdItineraryVote;
          const createItineraryRefreshError = await refreshDailyVoteResults();
          if (createItineraryRefreshError) return createItineraryRefreshError;
          return createdItineraryVote;
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
          const placeVoteResult = await votesRepositoryInstance.updateVotePlace(
            userId, 
            !info.value,
            voteData.placeid, 
            info.id );
          if (placeVoteResult.status !== 200) return placeVoteResult;
          const placeRefreshError = await refreshDailyVoteResults();
          if (placeRefreshError) return placeRefreshError;
          return placeVoteResult;
          break;
        case 404:
          const createdPlaceVote = await votesRepositoryInstance.createVotePlace(
            userId, 
            voteData);
          if (createdPlaceVote.status !== 201) return createdPlaceVote;
          const createPlaceRefreshError = await refreshDailyVoteResults();
          if (createPlaceRefreshError) return createPlaceRefreshError;
          return createdPlaceVote;
          break;
      }
    }
    
    return { status: 400, error: "Invalid vote data" };
  },

  updateVote: async (userId, voteData) => {
    const result = await votesRepositoryInstance.updateVote(userId, voteData);
    if (result.status !== 200) {
      return result;
    }

    const refreshError = await refreshDailyVoteResults();
    if (refreshError) return refreshError;

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
