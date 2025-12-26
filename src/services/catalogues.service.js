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
        
        return {
            status: 200,
            data: {
                countries: countries.data,
                states: states.data,
                cities: cities.data
            }
        };
    }
};


export default cataloguesService;