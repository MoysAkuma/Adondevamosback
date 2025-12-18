import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import cataloguesService from "../services/catalogues.service.js";

const getAllCatalogues = async (req, res, next) => {
    try {
        const catalogues = await cataloguesService.getAllCatalogues();

        if (catalogues.status !== 200) {
            throw new ApiError(catalogues.status, "Failed to retrieve catalogues");
        }
        new ApiResponse(res).success(
            'Catalogues retrieved successfully',
            catalogues.data
        );
    } catch (error) {
        next(error);
    }
};

export default {
    getAllCatalogues
};   