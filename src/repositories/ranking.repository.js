class RankingRepository {
    constructor({ rankingClient, placesClient, tripsClient }) {
        this.rankingClient = rankingClient;
        this.placesClient = placesClient;
        this.tripsClient = tripsClient;
    }

    async getTopVotedPlaces(limit = 3) {
        const rankingRowResult = await this.getLatestRankingRow('votes_results_places');
        if (rankingRowResult.status !== 200) return rankingRowResult;

        const topEntities = this.getTopEntitiesFromResultsRow(rankingRowResult.data, limit);
        const entityIds = topEntities.map(item => item.id);
        if (entityIds.length === 0) return { status: 200, data: [] };

        const { data: places, error: placesError } = await this.placesClient
            .from('places')
            .select('id, name')
            .in('id', entityIds);

        if (placesError) return { status: 500, error: placesError.message };

        const enrichedData = this.mergeEntityData(topEntities, places);

        return { status: 200, data: enrichedData };
    }

    async getTopVotedTrips(limit = 3) {
        const rankingRowResult = await this.getLatestRankingRow('votes_results_trips');
        if (rankingRowResult.status !== 200) return rankingRowResult;

        const topEntities = this.getTopEntitiesFromResultsRow(rankingRowResult.data, limit);
        const entityIds = topEntities.map(item => item.id);
        if (entityIds.length === 0) return { status: 200, data: [] };

        const { data: trips, error: tripsError } = await this.tripsClient
            .from('trips')
            .select('id, name')
            .in('id', entityIds);

        if (tripsError) return { status: 500, error: tripsError.message };

        const enrichedData = this.mergeEntityData(topEntities, trips);

        return { status: 200, data: enrichedData };
    }

    async getTopVotedItineraries(limit = 3) {
        const rankingRowResult = await this.getLatestRankingRow('votes_results_itinerary');
        if (rankingRowResult.status !== 200) return rankingRowResult;

        const topEntities = this.getTopEntitiesFromResultsRow(rankingRowResult.data, limit);
        const entityIds = topEntities.map(item => item.id);
        if (entityIds.length === 0) return { status: 200, data: [] };

        const { data: trips, error: tripsError } = await this.tripsClient
            .from('trips')
            .select('id, name')
            .in('id', entityIds);

        if (tripsError) return { status: 500, error: tripsError.message };

        const enrichedData = this.mergeEntityData(topEntities, trips);

        return { status: 200, data: enrichedData };
    }

    async getLatestRankingRow(tableName) {
        const { data, error } = await this.rankingClient
            .from(tableName)
            .select('first, second, third, count_first, count_second, count_third')
            .order('createddate', { ascending: false })
            .limit(1);

        if (error) return { status: 500, error: error.message };

        return { status: 200, data: data && data.length > 0 ? data[0] : null };
    }

    getTopEntitiesFromResultsRow(row, limit) {
        if (!row) return [];

        const allItems = [
            { id: row.first, voteCount: row.count_first ?? 0 },
            { id: row.second, voteCount: row.count_second ?? 0 },
            { id: row.third, voteCount: row.count_third ?? 0 }
        ];

        return allItems
            .filter(item => item.id != null)
            .slice(0, Math.max(0, Math.min(3, limit)));
    }

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
