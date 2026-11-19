import exceptions from '../middleware/exceptions.middleware.js';
import rankingService from '../services/ranking.service.js';

const getTopVoted = async (req, res, next) => {
    try {
        const { entityType } = req.params;
        const limit = parseInt(req.query.limit) || 3;

        if (!entityType) {
            throw exceptions.badRequest('Entity type is required');
        }

        const result = await rankingService.getTopVotedEntities(entityType, limit);

        return res.success(
            `Top ${limit} voted ${entityType} retrieved successfully`,
            result
        );
    } catch (err) {
        next(err);
    }
};

const getValidEntityTypes = async (req, res, next) => {
    try {
        const entityTypes = rankingService.getValidEntityTypes();
        
        return res.success(
            'Valid entity types retrieved successfully',
            { entityTypes }
        );
    } catch (err) {
        next(err);
    }
};

const rankingController = {
    getTopVoted,
    getValidEntityTypes
};

export default rankingController;
