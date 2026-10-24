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
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }

    async getVotesByPlaces(placeIds = [], 
        fields = 'id, placeid, userid, value') {
        const { data, error } = await this.votesClient
            .from('places')
            .select(fields)
            .in('placeid', placeIds);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
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
        if (error) return { status: 500, error: error.message };
        return { status: 201 };
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
        if (error) return { status: 500, error: error.message };
        return { status: 201 };
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
        if (error) return { status: 500, error: error.message };
        return { status: 201 };

    }

    async updateVote(userId, voteData) {
        const { data, error } = await this.votesClient
            .from('votes')
            .update(voteData)
            .eq('userid', userId)
            .select();
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data[0] };
    }

    async verifyVoteTripExists(userId, tripid) {
        const { data, error } = await this.votesClient
            .from('trips')
            .select('value')
            .eq('userid', userId)
            .eq('tripid', tripid)
            .eq('value', true);
        if (error) return { status: 500, error: error.message };
        const exists = data && data.length > 0;
        return { status: 200, data: { exists } };
    }
    async getUserVoteByTripIdAndUserId(tripId, userId) {
        const {data, error} = await 
        this.votesClient
          .from('trips')
          .select('id,value')
          .eq('tripid', tripId)
          .eq('userid', userId)
          .single();
        if (error) return { status: 404 };
        
        return { status: 200, data: data };
    }
    async updateVoteTrips(userId, value = false, tripId, voteId) {
        let query = this.votesClient
            .from('trips');
       
        query = query.update(
            { 
                value: value, 
                lastupdateddate: new Date() 
            })
            .eq('userid', userId)
            .eq('tripid', tripId)
            .eq('id', voteId);
        
        const { data, error } = await query.select();
        
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data[0] };
    }
    async getVotesByTripId(tripId, 
        fields = 'id, value, userid') {
        const { data, error } = await this.votesClient
            .from('trips')
            .select(fields)
            .eq('value', true)
            .eq('tripid', tripId);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
    async getUserVoteByPlaceIdAndUserId(placeId, userId) {
        const {data, error} = await 
        this.votesClient
          .from('places')
          .select('id,value')
          .eq('placeid', placeId)
          .eq('userid', userId)
          .single();
        if (error) return { status: 404 };
        return { status: 200, data: data };
    }
    async updateVoteItinerary(userId, value = false, tripId, placeId) {
        let query = this.votesClient
            .from('trips_itineraries');
        query = query.update(
            { 
                value: value,
                updateddate: new Date() 
            })
            .eq('userid', userId)
            .eq('tripid', tripId)
            .eq('placeid', placeId);
        const { data, error } = await query.select();
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data[0] };
    }
    async getUserVoteByItineraryTripIdPlaceIdAndUserId(tripId, placeId, userId) {
        const {data, error} = await 
        this.votesClient
            .from('trips_itineraries') 
            .select('id,value')
            .eq('tripid', tripId)
            .eq('placeid', placeId)
            .eq('userid', userId)
            .single();
        if (error) return { status: 404 };
        return { status: 200, data: data };
    } 
    async updateVotePlace(userId, value = false, placeId, voteId) {
        let query = this.votesClient
            .from('places');
        query = query.update(
            { 
                value: value,
                lastupdateddate: new Date()
            })
            .eq('userid', userId)
            .eq('placeid', placeId)
            .eq('id', voteId);
        const { data, error } = await query.select();
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data[0] };
    }
    async getVotesByPlaceId(placeId, 
        fields = 'id, value, userid') {
        const { data, error } = await this.votesClient
            .from('places')
            .select(fields)
            .eq('value', true)
            .eq('placeid', placeId);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }

    async countVotesByUserId(userId, voteType = 'trips') {
        const table = voteType === 'trips' ? 'trips' : 'places';
        const { data, error, count } = await this.votesClient
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('userid', userId)
            .eq('value', true);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: count };
    }

    async getVotedTripsByUserId(userId, limit = 3) {
        const { data, error } = await this.votesClient
            .from('trips')
            .select('tripid, createddate')
            .eq('userid', userId)
            .eq('value', true)
            .order('createddate', { ascending: false })
            .limit(limit);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }

    async updateDailyVotesResults() {
        const tripsRanking = await this.getTopVotesByField('trips', 'tripid');
        if (tripsRanking.status !== 200) return tripsRanking;

        const placesRanking = await this.getTopVotesByField('places', 'placeid');
        if (placesRanking.status !== 200) return placesRanking;

        const itinerariesRanking = await this.getTopVotesByField('trips_itineraries', 'tripid');
        if (itinerariesRanking.status !== 200) return itinerariesRanking;

        const tripsResult = await this.upsertDailyRanking(
            'votes_results_trips',
            tripsRanking.data,
            'votes-service'
        );
        if (tripsResult.status !== 200) return tripsResult;

        const placesResult = await this.upsertDailyRanking(
            'votes_results_places',
            placesRanking.data,
            'votes-service'
        );
        if (placesResult.status !== 200) return placesResult;

        const itineraryResult = await this.upsertDailyRanking(
            'votes_results_itinerary',
            itinerariesRanking.data,
            'votes-service'
        );
        if (itineraryResult.status !== 200) return itineraryResult;

        return { status: 200 };
    }

    async getTopVotesByField(tableName, fieldName, limit = 3) {
        const { data, error } = await this.votesClient
            .from(tableName)
            .select(fieldName)
            .eq('value', true);

        if (error) return { status: 500, error: error.message };

        const counts = {};
        for (const vote of data || []) {
            const entityId = vote[fieldName];
            if (entityId == null) continue;
            counts[entityId] = (counts[entityId] || 0) + 1;
        }

        const ranking = Object.entries(counts)
            .map(([id, total]) => ({ id: Number(id), total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);

        return { status: 200, data: ranking };
    }

    async upsertDailyRanking(tableName, ranking = [], generatedBy = 'votes-service') {
        if (!this.rankingClient) {
            return { status: 500, error: 'Ranking client is not configured' };
        }

        const dayRange = this.getUtcDayRange();
        const { data: existingRows, error: selectError } = await this.rankingClient
            .from(tableName)
            .select('id')
            .gte('createddate', dayRange.start)
            .lt('createddate', dayRange.end)
            .order('createddate', { ascending: false })
            .limit(1);

        if (selectError) return { status: 500, error: selectError.message };

        const payload = {
            first: ranking[0]?.id ?? null,
            second: ranking[1]?.id ?? null,
            third: ranking[2]?.id ?? null,
            count_first: ranking[0]?.total ?? 0,
            count_second: ranking[1]?.total ?? 0,
            count_third: ranking[2]?.total ?? 0,
            updateddate: new Date().toISOString(),
            generatedby: generatedBy
        };

        if (existingRows && existingRows.length > 0) {
            const { error: updateError } = await this.rankingClient
                .from(tableName)
                .update(payload)
                .eq('id', existingRows[0].id);

            if (updateError) return { status: 500, error: updateError.message };
            return { status: 200 };
        }

        const { error: insertError } = await this.rankingClient
            .from(tableName)
            .insert({
                createddate: new Date().toISOString(),
                ...payload
            });

        if (insertError) return { status: 500, error: insertError.message };
        return { status: 200 };
    }

    getUtcDayRange() {
        const now = new Date();
        const startDate = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0
        ));
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + 1);

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        };
    }

};

export default VotesRepository;