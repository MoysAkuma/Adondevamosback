class VotesRepository {
  constructor({ votesClient }) {
    this.votesClient = votesClient;
  }
    async getVotesByTrips(tripIds = [], fields = 'id, tripid, userid, value') {
        const { data, error } = await this.votesClient
            .from('trips')
            .select(fields)
            .in('tripid', tripIds);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
    async getVotesByPlaces(placeIds = [], fields = 'id, placeid, userid, value') {
        const { data, error } = await this.votesClient
            .from('places')
            .select(fields)
            .in('placeid', placeIds);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
};

export default VotesRepository;