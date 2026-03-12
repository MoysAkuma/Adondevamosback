import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import rankingService from '../services/ranking.service.js';

const getTopVoted = async (req, res, next) => {
    try {
        const { entityType } = req.params;
        const limit = parseInt(req.query.limit) || 3;

        if (!entityType) {
            throw new ApiError(400, 'Entity type is required');
        }

        const result = await rankingService.getTopVotedEntities(entityType, limit);

        if (result.status !== 200) {
            throw new ApiError(result.status, result.error);
        }

        return new ApiResponse(res).success(
            `Top ${limit} voted ${entityType} retrieved successfully`,
            result.data
        );
    } catch (err) {
        next(err);
    }
};

const getValidEntityTypes = async (req, res, next) => {
    try {
        const entityTypes = rankingService.getValidEntityTypes();
        
        return new ApiResponse(res).success(
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
