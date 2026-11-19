import exceptions from '../middleware/exceptions.middleware.js';

class VotesRepository {
    constructor({ votesClient, rankingClient }) {
        this.votesClient = votesClient;
        this.rankingClient = rankingClient;
    }

    async getVotesByTrips(tripIds = [],
        fields = 'id, tripid, userid, value') {
        const { data, error } = await this.votesClient
            .from('trips')
            .select(fields)
            .in('tripid', tripIds);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async getVotesByPlaces(placeIds = [],
        fields = 'id, placeid, userid, value') {
        const { data, error } = await this.votesClient
            .from('places')
            .select(fields)
            .in('placeid', placeIds);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async createVoteTrips(userId, voteData,
        value = true) {
        const { data, error } = await this.votesClient
            .from('trips')
            .insert({
                userid: userId,
                tripid: voteData.tripid,
                value: value
            })
            .select();
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async createVotePlace(userId, voteData,
        value = true) {
        const { data, error } = await this.votesClient
            .from('places')
            .insert({
                userid: userId,
                placeid: voteData.placeid,
                value: value
            })
            .select();
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async createVoteItinerary(userId, voteData,
        value = true) {
        const { data, error } = await this.votesClient
            .from('trips_itineraries')
            .insert({
                userid: userId,
                placeid: voteData.placeid,
                tripid: voteData.tripid,
                value: value
            })
            .select();
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async updateVote(userId, voteData) {
        const { data, error } = await this.votesClient
            .from('votes')
            .update(voteData)
            .eq('userid', userId)
            .select();
        if (error) throw exceptions.internal(error.message);
        return data?.[0] ?? null;
    }

    async verifyVoteTripExists(userId, tripid) {
        const { data, error } = await this.votesClient
            .from('trips')
            .select('value')
            .eq('userid', userId)
            .eq('tripid', tripid)
            .eq('value', true);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async getUserVoteByTripIdAndUserId(tripId, userId) {
        const { data, error } = await this.votesClient
            .from('trips')
            .select('id,value')
            .eq('tripid', tripId)
            .eq('userid', userId)
            .maybeSingle();
        if (error) throw exceptions.internal(error.message);
        return data;
    }

    async updateVoteTrips(userId, value = false, tripId, voteId) {
        const { data, error } = await this.votesClient
            .from('trips')
            .update({
                value: value,
                lastupdateddate: new Date()
            })
            .eq('userid', userId)
            .eq('tripid', tripId)
            .eq('id', voteId)
            .select();
        if (error) throw exceptions.internal(error.message);
        return data?.[0] ?? null;
    }

    async getVotesByTripId(tripId,
        fields = 'id, value, userid') {
        const { data, error } = await this.votesClient
            .from('trips')
            .select(fields)
            .eq('value', true)
            .eq('tripid', tripId);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async getUserVoteByPlaceIdAndUserId(placeId, userId) {
        const { data, error } = await this.votesClient
            .from('places')
            .select('id,value')
            .eq('placeid', placeId)
            .eq('userid', userId)
            .maybeSingle();
        if (error) throw exceptions.internal(error.message);
        return data;
    }

    async updateVoteItinerary(userId, value = false, tripId, placeId) {
        const { data, error } = await this.votesClient
            .from('trips_itineraries')
            .update({
                value: value,
                updateddate: new Date()
            })
            .eq('userid', userId)
            .eq('tripid', tripId)
            .eq('placeid', placeId)
            .select();
        if (error) throw exceptions.internal(error.message);
        return data?.[0] ?? null;
    }

    async getUserVoteByItineraryTripIdPlaceIdAndUserId(tripId, placeId, userId) {
        const { data, error } = await this.votesClient
            .from('trips_itineraries')
            .select('id,value')
            .eq('tripid', tripId)
            .eq('placeid', placeId)
            .eq('userid', userId)
            .maybeSingle();
        if (error) throw exceptions.internal(error.message);
        return data;
    }

    async updateVotePlace(userId, value = false, placeId, voteId) {
        const { data, error } = await this.votesClient
            .from('places')
            .update({
                value: value,
                lastupdateddate: new Date()
            })
            .eq('userid', userId)
            .eq('placeid', placeId)
            .eq('id', voteId)
            .select();
        if (error) throw exceptions.internal(error.message);
        return data?.[0] ?? null;
    }

    async getVotesByPlaceId(placeId,
        fields = 'id, value, userid') {
        const { data, error } = await this.votesClient
            .from('places')
            .select(fields)
            .eq('value', true)
            .eq('placeid', placeId);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async countVotesByUserId(userId, voteType = 'trips') {
        const table = voteType === 'trips' ? 'trips' : 'places';
        const { count, error } = await this.votesClient
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('userid', userId)
            .eq('value', true);
        if (error) throw exceptions.internal(error.message);
        return count || 0;
    }

    async getVotedTripsByUserId(userId, limit = 3) {
        const { data, error } = await this.votesClient
            .from('trips')
            .select('tripid, createddate')
            .eq('userid', userId)
            .eq('value', true)
            .order('createddate', { ascending: false })
            .limit(limit);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    async getTrueVotesByField(tableName, fieldName) {
        const { data, error } = await this.votesClient
            .from(tableName)
            .select(fieldName)
            .eq('value', true);
        if (error) throw exceptions.internal(error.message);
        return data || [];
    }

    _requireRankingClient() {
        if (!this.rankingClient) {
            throw exceptions.internal('Ranking client is not configured');
        }
        return this.rankingClient;
    }

    async getRankingRowForDay(tableName, dayRange) {
        const { data, error } = await this._requireRankingClient()
            .from(tableName)
            .select('id')
            .gte('createddate', dayRange.start)
            .lt('createddate', dayRange.end)
            .order('createddate', { ascending: false })
            .limit(1);
        if (error) throw exceptions.internal(error.message);
        return data?.[0] ?? null;
    }

    async updateRankingRow(tableName, id, payload) {
        const { error } = await this._requireRankingClient()
            .from(tableName)
            .update(payload)
            .eq('id', id);
        if (error) throw exceptions.internal(error.message);
    }

    async insertRankingRow(tableName, row) {
        const { error } = await this._requireRankingClient()
            .from(tableName)
            .insert(row);
        if (error) throw exceptions.internal(error.message);
    }
}

export default VotesRepository;
