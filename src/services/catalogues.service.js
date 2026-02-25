import cataloguesRepository from '../repositories/catalogues.repository.js';
import { cataloguesClient } from '../config/supabase.js';
import { CatalogueOptionModel } from '../models/catalogue-option.model.js';

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
        if (countries.status !== 200) return countries;
        const states = await cataloguesRepo.getAllStates();
        if (states.status !== 200) return states;
        const cities = await cataloguesRepo.getAllCities();
        if (cities.status !== 200) return cities;
        const facilities = await cataloguesRepo.getAllFacilities();
        if (facilities.status !== 200) return facilities;
        return {
            status: 200,
            data: {
                countries: countries.data,
                states: states.data,
                cities: cities.data,
                facilities: facilities.data
            }
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
        try {
            const validatedId = CatalogueOptionModel.validateId(id);
            const validatedData = CatalogueOptionModel.forUpdate(option, data);

            return await executeCatalogueAction(
                option,
                'update',
                validatedData,
                validatedId
            );
        } catch (error) {
            return { status: 400, error: error.message };
        }
    },
    async createCatalogueOption(option, data)
    {
        try {
            const validatedData = CatalogueOptionModel.forCreate(option, data);
            return await executeCatalogueAction(option, 'create', validatedData);
        } catch (error) {
            return { status: 400, error: error.message };
        }
       
    }

};


export default cataloguesService;