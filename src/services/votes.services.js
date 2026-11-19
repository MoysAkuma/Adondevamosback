import VotesRepository  from "../repositories/votes.repository.js";
import exceptions from "../middleware/exceptions.middleware.js";
import { votesClient, publicServiceClient } from "../config/supabase.js";
const votesRepositoryInstance = new VotesRepository({ votesClient, rankingClient: publicServiceClient });

const DAILY_RANKING_TABLES = [
  { tableName: 'votes_results_trips', sourceTable: 'trips', fieldName: 'tripid' },
  { tableName: 'votes_results_places', sourceTable: 'places', fieldName: 'placeid' },
  { tableName: 'votes_results_itinerary', sourceTable: 'trips_itineraries', fieldName: 'tripid' },
];

const getTopVotes = (rows, fieldName, limit = 3) => {
  const counts = {};
  for (const row of rows) {
    const entityId = row[fieldName];
    if (entityId == null) continue;
    counts[entityId] = (counts[entityId] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([id, total]) => ({ id: Number(id), total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

const getUtcDayRange = () => {
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  return { start: startDate.toISOString(), end: endDate.toISOString() };
};

const upsertDailyRanking = async (tableName, ranking) => {
  const existingRow = await votesRepositoryInstance.getRankingRowForDay(tableName, getUtcDayRange());
  const payload = {
    first: ranking[0]?.id ?? null,
    second: ranking[1]?.id ?? null,
    third: ranking[2]?.id ?? null,
    count_first: ranking[0]?.total ?? 0,
    count_second: ranking[1]?.total ?? 0,
    count_third: ranking[2]?.total ?? 0,
    updateddate: new Date().toISOString(),
    generatedby: 'votes-service'
  };

  if (existingRow) {
    return await votesRepositoryInstance.updateRankingRow(tableName, existingRow.id, payload);
  }
  return await votesRepositoryInstance.insertRankingRow(tableName, {
    createddate: new Date().toISOString(),
    ...payload
  });
};

const refreshDailyVoteResults = async () => {
  for (const { tableName, sourceTable, fieldName } of DAILY_RANKING_TABLES) {
    const rows = await votesRepositoryInstance.getTrueVotesByField(sourceTable, fieldName);
    await upsertDailyRanking(tableName, getTopVotes(rows, fieldName));
  }
};

const votesService = {
  createVote: async (userId, voteData) => {
    if (voteData.tripid && 
      !voteData.placeid ) {
      //valida if vote exists and change or create
      const userVotedTrip = await 
        votesRepositoryInstance.getUserVoteByTripIdAndUserId(voteData.tripid, 
        userId);

      if (userVotedTrip) {
        //update vote
        const voteResult = await votesRepositoryInstance.updateVoteTrips(
          userId, 
          !userVotedTrip.value,
          voteData.tripid,
          userVotedTrip.id );
        await refreshDailyVoteResults();
        return voteResult;
      }

      const createdTripVote = await votesRepositoryInstance.createVoteTrips(
        userId, 
        voteData);
      await refreshDailyVoteResults();
      return createdTripVote;

    } else if (voteData.tripid && voteData.placeid) {
      //vote itinerary
      const userVotedItinerary = await 
      votesRepositoryInstance.getUserVoteByItineraryTripIdPlaceIdAndUserId(
        voteData.tripid, voteData.placeid, userId);

      if (userVotedItinerary) {
        //update vote
        const itineraryVoteResult = await votesRepositoryInstance.updateVoteItinerary(
          userId, 
          !userVotedItinerary.value,
          voteData.tripid,
          voteData.placeid );
        await refreshDailyVoteResults();
        return itineraryVoteResult;
      }

      const createdItineraryVote = await votesRepositoryInstance.createVoteItinerary(
        userId, 
        voteData);
      await refreshDailyVoteResults();
      return createdItineraryVote;

    } else if (!voteData.tripid && voteData.placeid) {
      const userVotedPlace = await 
      votesRepositoryInstance.getUserVoteByPlaceIdAndUserId(
        voteData.placeid, userId);

      if (userVotedPlace) {
        //update vote
        const placeVoteResult = await votesRepositoryInstance.updateVotePlace(
          userId, 
          !userVotedPlace.value,
          voteData.placeid, 
          userVotedPlace.id );
        await refreshDailyVoteResults();
        return placeVoteResult;
      }

      const createdPlaceVote = await votesRepositoryInstance.createVotePlace(
        userId, 
        voteData);
      await refreshDailyVoteResults();
      return createdPlaceVote;
    }

    throw exceptions.badRequest("Invalid vote data");
  },

  updateVote: async (userId, voteData) => {
    const result = await votesRepositoryInstance.updateVote(userId, voteData);
    await refreshDailyVoteResults();
    return result;
  },
  getVotesByTrip: async (tripId) => {
    const votes = await votesRepositoryInstance.getVotesByTripId(tripId);
    return {
      summary: votes.length
    };
  },
  getVotesByPlace: async (placeId) => {
    const votes = await votesRepositoryInstance.getVotesByPlaceId(placeId);
    return {
      summary: votes.length
    };
  } 
};
export default votesService;
