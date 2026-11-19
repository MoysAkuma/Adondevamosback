import cataloguesRepository from '../repositories/catalogues.repository.js';
import { cataloguesClient } from '../config/supabase.js';
import { CatalogueOptionModel } from '../models/catalogue-option.model.js';
import exceptions from '../middleware/exceptions.middleware.js';

const cataloguesRepo = new cataloguesRepository({ cataloguesClient });

const CATALOGUE_ACTIONS = {
    country: {
        createMethod: 'createCountry',
        updateMethod: 'updateCountryField'
    },
    state: {
        createMethod: 'createState',
        updateMethod: 'updateStateField'
    },
    city: {
        createMethod: 'createCity',
        updateMethod: 'updateCityField'
    },
    facility: {
        createMethod: 'createFacility',
        updateMethod: 'updateFacilityField'
    }
};

async function executeCatalogueAction(option, type, data, id = null) {
    const selectedOption = CatalogueOptionModel.validateOption(option);
    const action = CATALOGUE_ACTIONS[selectedOption];
    const repositoryMethod =
        type === 'create' ? action.createMethod : action.updateMethod;

    if (type === 'create') {
        return await cataloguesRepo[repositoryMethod](data);
    }

    return await cataloguesRepo[repositoryMethod](data, id);
}

const cataloguesService = {
    
    async getAllCatalogues() {
        const countries = await cataloguesRepo.getAllCountries();
        const states = await cataloguesRepo.getAllStates();
        const cities = await cataloguesRepo.getAllCities();
        const facilities = await cataloguesRepo.getAllFacilities();
        return {
            countries,
            states,
            cities,
            facilities
        };
    },
    async getAllCountries() {
        return await cataloguesRepo.getAllCountries();
    },
    async getAllStates()
    {
        return await cataloguesRepo.getAllStates();
    },
    async getAllCities()
    {
        return await cataloguesRepo.getAllCities();
    }
    ,
    async getAllFacilities()
    {
        return await cataloguesRepo.getAllFacilities();
    },
    async updateCatalogueOption(option, id, data)
    {
        let validatedId;
        let validatedData;
        try {
            validatedId = CatalogueOptionModel.validateId(id);
            validatedData = CatalogueOptionModel.forUpdate(option, data);
        } catch (error) {
            throw exceptions.badRequest(error.message);
        }

        return await executeCatalogueAction(
            option,
            'update',
            validatedData,
            validatedId
        );
    },
    async createCatalogueOption(option, data)
    {
        let validatedData;
        try {
            validatedData = CatalogueOptionModel.forCreate(option, data);
        } catch (error) {
            throw exceptions.badRequest(error.message);
        }
        return await executeCatalogueAction(option, 'create', validatedData);
    }

};


export default cataloguesService;