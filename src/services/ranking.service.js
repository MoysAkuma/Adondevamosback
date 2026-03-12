import RankingRepository from '../repositories/ranking.repository.js';
import { votesClient, clientPlaces, clientTrips } from '../config/supabase.js';

const rankingRepo = new RankingRepository({ 
    votesClient, 
    placesClient: clientPlaces, 
    tripsClient: clientTrips 
});

const VALID_ENTITY_TYPES = ['places', 'trips', 'itineraries'];

const rankingService = {
    async getTopVotedEntities(entityType, limit = 3) {
        // Validate entity type
        if (!VALID_ENTITY_TYPES.includes(entityType)) {
            return { 
                status: 400, 
                error: `Invalid entity type. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}` 
            };
        }

        let result;
        switch (entityType) {
            case 'places':
                result = await rankingRepo.getTopVotedPlaces(limit);
                break;
            case 'trips':
                result = await rankingRepo.getTopVotedTrips(limit);
                break;
            case 'itineraries':
                result = await rankingRepo.getTopVotedItineraries(limit);
                break;
            default:
                return { status: 400, error: 'Invalid entity type' };
        }

        if (result.status !== 200) {
            return result;
        }

        return { 
            status: 200, 
            data: {
                entityType,
                ranking: result.data
            }
        };
    },

    getValidEntityTypes() {
        return VALID_ENTITY_TYPES;
    }
};

export default rankingService;
