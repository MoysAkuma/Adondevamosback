import cataloguesRepository from '../repositories/catalogues.repository.js';
import { cataloguesClient } from '../config/supabase.js';
const cataloguesRepo = new cataloguesRepository({ cataloguesClient });

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
        
        switch(option) {
            case 'country':
                return await cataloguesRepo.updateCountryField(data, id);
            case 'state':
                return await cataloguesRepo.updateStateField(data, id);
            case 'city':
                return await cataloguesRepo.updateCityField(data, id);
            case 'facility':
                return await cataloguesRepo.updateFacilityField(data, id);
            default:
                return { status: 400, error: "Invalid option" };
        }
    },
    async createCatalogueOption(option, data)
    {
        switch(option) {
            case 'country':
                return await cataloguesRepo.createCountry(data);
            case 'state':
                return await cataloguesRepo.createState(data);
            case 'city':
                return await cataloguesRepo.createCity(data);
            case 'facility':
                return await cataloguesRepo.createFacility(data);
            default:
                return { status: 400, error: "Invalid option" };
        }
       
    }

};


export default cataloguesService;