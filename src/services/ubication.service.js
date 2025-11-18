import { cataloguesClient } from "../config/supabase.js";

const ubicationService = {
  async getCountries() {
    const { data, error } = await cataloguesClient
      .from('countries')
      .select('id, name, code, flagurl')
      .order('name', { ascending: true });
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
    },
async getUbicationNamesByIDs( countryIds = [], stateIds = [], cityIds = []) {
    const result = {};
    if (countryIds.length > 0) {
        const { data: countries, error: countryError } = await cataloguesClient
        .from('countries')
        .select('id, name, acronym')
        .in('id', countryIds);
        if (countryError) return { status: 500, error: countryError.message };
        result.countries = countries;
    }
    if (stateIds.length > 0) {
        const { data: states, error: stateError } = await cataloguesClient
        .from('states')
        .select('id, name')
        .in('id', stateIds);
        if (stateError) return { status: 500, error: stateError.message };
        result.states = states;
    }
    if (cityIds.length > 0) {
        const { data: cities, error: cityError } = await cataloguesClient
        .from('cities')
        .select('id, name')
        .in('id', cityIds);
        if (cityError) return { status: 500, error: cityError.message };
        result.cities = cities;
    }
    return { status: 200, data: result };
  }
};

export default ubicationService; 