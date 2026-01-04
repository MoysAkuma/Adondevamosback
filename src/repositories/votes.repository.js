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
};

export default VotesRepository;