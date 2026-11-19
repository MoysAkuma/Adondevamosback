import exceptions from '../middleware/exceptions.middleware.js';
import cataloguesService from "../services/catalogues.service.js";

const getAllCatalogues = async (req, res, next) => {
    try {
        const catalogues = await cataloguesService.getAllCatalogues();

        res.success(
            'Catalogues retrieved successfully',
            catalogues
        );
    } catch (error) {
        next(error);
    }
};

const getAllCountries = async (req, res, next) => {
    try {
        const countries = await cataloguesService.getAllCountries();
        res.success(
            'Countries retrieved successfully',
            countries
        );
    } catch (error) {
        next(error);
    }
};

const getAllStates = async (req, res, next) => {
    try {
        const states = await cataloguesService.getAllStates();
        res.success(
            'States retrieved successfully',
            states
        );
    }
    catch (error) {
        next(error);
    }
};
const getAllCities = async (req, res, next) => {
    try {
        const cities = await cataloguesService.getAllCities();
        res.success(
            'Cities retrieved successfully',
            cities
        );
    } catch (error) {
        next(error);
    }   
};
const getAllFacilities = async (req, res, next) => {
    try {
        const facilities = await cataloguesService.getAllFacilities();
        res.success(
            'Facilities retrieved successfully',
            facilities
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
            throw exceptions.badRequest("Invalid option provided");
        }
        
        if (!id || isNaN(id)) {
            throw exceptions.badRequest("Invalid ID provided");
        }
        
        const result = 
        await cataloguesService.updateCatalogueOption(option, id, data);
        res.success(
            `${option} updated successfully`,
            result
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
            throw exceptions.badRequest("Invalid option provided");
        }
        await cataloguesService.createCatalogueOption(option, data);

        res.successNoData(201);

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