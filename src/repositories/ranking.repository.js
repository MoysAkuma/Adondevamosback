class RankingRepository {
    constructor({ votesClient, placesClient, tripsClient }) {
        this.votesClient = votesClient;
        this.placesClient = placesClient;
        this.tripsClient = tripsClient;
    }

    async getTopVotedPlaces(limit = 3) {
        const { data, error } = await this.votesClient
            .from('places')
            .select('placeid')
            .eq('value', true);
        
        if (error) return { status: 500, error: error.message };
        
        // Group and count votes by placeid
        const voteCounts = this.countVotes(data, 'placeid');
        const topEntities = this.getTopEntities(voteCounts, limit);
        
        // Get entity details
        const entityIds = topEntities.map(e => e.id);
        if (entityIds.length === 0) return { status: 200, data: [] };
        
        const { data: places, error: placesError } = await this.placesClient
            .from('places')
            .select('id, name')
            .in('id', entityIds);
        
        if (placesError) return { status: 500, error: placesError.message };
        
        // Merge entity info with vote counts
        const enrichedData = this.mergeEntityData(topEntities, places);
        
        return { status: 200, data: enrichedData };
    }

    async getTopVotedTrips(limit = 3) {
        const { data, error } = await this.votesClient
            .from('trips')
            .select('tripid')
            .eq('value', true);
        
        if (error) return { status: 500, error: error.message };
        
        // Group and count votes by tripid
        const voteCounts = this.countVotes(data, 'tripid');
        const topEntities = this.getTopEntities(voteCounts, limit);
        
        // Get entity details
        const entityIds = topEntities.map(e => e.id);
        if (entityIds.length === 0) return { status: 200, data: [] };
        
        const { data: trips, error: tripsError } = await this.tripsClient
            .from('trips')
            .select('id, name')
            .in('id', entityIds);
        
        if (tripsError) return { status: 500, error: tripsError.message };
        
        // Merge entity info with vote counts
        const enrichedData = this.mergeEntityData(topEntities, trips);
        
        return { status: 200, data: enrichedData };
    }

    async getTopVotedItineraries(limit = 3) {
        const { data, error } = await this.votesClient
            .from('trips_itineraries')
            .select('tripid, placeid')
            .eq('value', true);
        
        if (error) return { status: 500, error: error.message };
        
        // Group and count votes by tripid (itinerary is tied to a trip)
        const voteCounts = this.countVotes(data, 'tripid');
        const topEntities = this.getTopEntities(voteCounts, limit);
        
        // Get entity details (trips for itineraries)
        const entityIds = topEntities.map(e => e.id);
        if (entityIds.length === 0) return { status: 200, data: [] };
        
        const { data: trips, error: tripsError } = await this.tripsClient
            .from('trips')
            .select('id, name')
            .in('id', entityIds);
        
        if (tripsError) return { status: 500, error: tripsError.message };
        
        // Merge entity info with vote counts
        const enrichedData = this.mergeEntityData(topEntities, trips);
        
        return { status: 200, data: enrichedData };
    }

    // Helper: Count votes grouped by a specific field
    countVotes(data, field) {
        const counts = {};
        for (const row of data || []) {
            const id = row[field];
            if (id != null) {
                counts[id] = (counts[id] || 0) + 1;
            }
        }
        return counts;
    }

    // Helper: Get top N entities sorted by vote count
    getTopEntities(voteCounts, limit) {
        return Object.entries(voteCounts)
            .map(([id, count]) => ({ id: Number(id), voteCount: count }))
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, limit);
    }

    // Helper: Merge entity details with vote counts
    mergeEntityData(topEntities, entityDetails) {
        const entityMap = new Map(entityDetails.map(e => [e.id, e]));
        
        return topEntities.map(item => {
            const entity = entityMap.get(item.id) || {};
            return {
                id: item.id,
                name: entity.name || null,
                Votes: {
                    Total: item.voteCount
                }
            };
        });
    }
}

export default RankingRepository;
