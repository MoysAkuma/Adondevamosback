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

const getAllCountries = async (req, res, next) => {
    try {
        const countries = await cataloguesService.getAllCountries();
        if (countries.status !== 200) {
            throw new ApiError(countries.status, "Failed to retrieve countries");
        }
        new ApiResponse(res).success(
            'Countries retrieved successfully',
            countries.data
        );
    } catch (error) {
        next(error);
    }
};

const getAllStates = async (req, res, next) => {
    try {
        const states = await cataloguesService.getAllStates();
        if (states.status !== 200) {
            throw new ApiError(states.status, "Failed to retrieve states");
        }
        new ApiResponse(res).success(
            'States retrieved successfully',
            states.data
        );
    }
    catch (error) {
        next(error);
    }
};
const getAllCities = async (req, res, next) => {
    try {
        const cities = await cataloguesService.getAllCities();
        if (cities.status !== 200) {
            throw new ApiError(cities.status, "Failed to retrieve cities");
        }
        new ApiResponse(res).success(
            'Cities retrieved successfully',
            cities.data
        );
    } catch (error) {
        next(error);
    }   
};
const getAllFacilities = async (req, res, next) => {
    try {
        const facilities = await cataloguesService.getAllFacilities();
        if (facilities.status !== 200) {
            throw new ApiError(facilities.status, "Failed to retrieve facilities");
        }
        new ApiResponse(res).success(
            'Facilities retrieved successfully',
            facilities.data
        );
    } catch (error) {
        next(error);
    }
};
const updateCatalogueOption = async (req, res, next) => {
    try {
        const { option, id } = req.params;
        const data = req.body;
        
        if (!['country', 'state', 'city', 'facility'].includes(option)) {
            throw new ApiError(400, "Invalid option provided");
        }
        
        if (!id || isNaN(id)) {
            throw new ApiError(400, "Invalid ID provided");
        }
        
        const result = 
        await cataloguesService.updateCatalogueOption(option, id, data);
        if (result.status !== 200) {
            throw new ApiError(result.status, `Failed to update ${option}`);
        }
        new ApiResponse(res).success(
            `${option} updated successfully`,
            result.data
        );
    } catch (error) {
        next(error);
    }
};

const createCatalogueOption = async (req, res, next) => {
    try {
        
        const { option } = req.params;
        const data = req.body;
        
        if (!['country', 'state', 'city', 'facility'].includes(option)) {
            throw new ApiError(400, "Invalid option provided");
        }
        const result = 
        await cataloguesService.createCatalogueOption(option, data);
        if (result.status !== 201) {
            throw new ApiError(result.status, `Failed to create ${option}`);
        }

        new ApiResponse(res).successNoData(201);

    } catch (error) {
        next(error);
    }
};


export default {
    getAllCatalogues,
    getAllCountries,
    getAllStates,
    getAllCities,
    getAllFacilities,
    updateCatalogueOption,
    createCatalogueOption
};   