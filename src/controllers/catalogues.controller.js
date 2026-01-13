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

const getCountries = async (req, res, next) => {
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

const getStates = async (req, res, next) => {
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
const getCities = async (req, res, next) => {
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
const getFacilities = async (req, res, next) => {
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


export default {
    getAllCatalogues,
    getCountries,
    getStates,
    getCities,
    getFacilities
};   