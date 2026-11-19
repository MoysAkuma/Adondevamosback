import RankingRepository from '../repositories/ranking.repository.js';
import exceptions from '../middleware/exceptions.middleware.js';
import { publicServiceClient, clientPlaces, clientTrips } from '../config/supabase.js';

const rankingRepo = new RankingRepository({ 
    rankingClient: publicServiceClient, 
    placesClient: clientPlaces, 
    tripsClient: clientTrips 
});

const VALID_ENTITY_TYPES = ['places', 'trips', 'itineraries'];

const RANKING_SOURCES = {
    places: { tableName: 'votes_results_places', getEntities: (ids) => rankingRepo.getPlacesByIds(ids) },
    trips: { tableName: 'votes_results_trips', getEntities: (ids) => rankingRepo.getTripsByIds(ids) },
    itineraries: { tableName: 'votes_results_itinerary', getEntities: (ids) => rankingRepo.getTripsByIds(ids) }
};

const getTopEntitiesFromResultsRow = (row, limit) => {
    if (!row) return [];

    const allItems = [
        { id: row.first, voteCount: row.count_first ?? 0 },
        { id: row.second, voteCount: row.count_second ?? 0 },
        { id: row.third, voteCount: row.count_third ?? 0 }
    ];

    return allItems
        .filter(item => item.id != null)
        .slice(0, Math.max(0, Math.min(3, limit)));
};

const mergeEntityData = (topEntities, entityDetails) => {
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
};

const rankingService = {
    async getTopVotedEntities(entityType, limit = 3) {
        if (!VALID_ENTITY_TYPES.includes(entityType)) {
            throw exceptions.badRequest(`Invalid entity type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
        }

        const source = RANKING_SOURCES[entityType];
        const rankingRow = await rankingRepo.getLatestRankingRow(source.tableName);
        const topEntities = getTopEntitiesFromResultsRow(rankingRow, limit);
        const entityIds = topEntities.map(item => item.id);

        if (entityIds.length === 0) {
            return { entityType, ranking: [] };
        }

        const entities = await source.getEntities(entityIds);

        return {
            entityType,
            ranking: mergeEntityData(topEntities, entities)
        };
    },

    getValidEntityTypes() {
        return VALID_ENTITY_TYPES;
    }
};

export default rankingService;
