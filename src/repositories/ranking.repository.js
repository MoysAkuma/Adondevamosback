import exceptions from '../middleware/exceptions.middleware.js';

class RankingRepository {
    constructor({ rankingClient, placesClient, tripsClient }) {
        this.rankingClient = rankingClient;
        this.placesClient = placesClient;
        this.tripsClient = tripsClient;
    }

    async getLatestRankingRow(tableName) {
        const { data, error } = await this.rankingClient
            .from(tableName)
            .select('first, second, third, count_first, count_second, count_third')
            .order('createddate', { ascending: false })
            .limit(1);

        if (error) throw exceptions.internal(error.message);
        return data?.[0] ?? null;
    }

    async getPlacesByIds(ids) {
        const { data, error } = await this.placesClient
            .from('places')
            .select('id, name')
            .in('id', ids);

        if (error) throw exceptions.internal(error.message);
        return data;
    }

    async getTripsByIds(ids) {
        const { data, error } = await this.tripsClient
            .from('trips')
            .select('id, name')
            .in('id', ids);

        return data;
    }
}

export default RankingRepository;
