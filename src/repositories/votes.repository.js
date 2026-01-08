class VotesRepository {
    constructor({ votesClient }) {
        this.votesClient = votesClient;
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
                lastupdateddate: new Date() 
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

};

export default VotesRepository;