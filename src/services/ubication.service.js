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
    /**
     * Get PlaceList with countryid, stateid and cityid in each, return a list of names
     */
async getUbicationNamesByIDs( placeList ) {
    //get ubication names for itinerary
    const countryIds = placeList.map(place => place.countryid);
    const stateIds = placeList.map(place => place.stateid);
    const cityIds = placeList.map(place => place.cityid);

    const result = {};
    //avoid duplicate ids
    const uniqueValuesIds = { 
      countries: [...new Set(countryIds)]
      , states: [...new Set(stateIds)]
      , cities: [...new Set(cityIds)]
    };
    
    if (countryIds.length > 0) {
        const { data: countries, error: countryError } = await cataloguesClient
        .from('countries')
        .select('id, name, acronym')
        .in('id', uniqueValuesIds.countries);
        if (countryError) return { status: 500, error: countryError.message };
        result.countries = countries;
    }
    if (stateIds.length > 0) {
        const { data: states, error: stateError } = await cataloguesClient
        .from('states')
        .select('id, name')
        .in('id', uniqueValuesIds.states);
        if (stateError) return { status: 500, error: stateError.message };
        result.states = states;
    }
    if (cityIds.length > 0) {
        const { data: cities, error: cityError } = await cataloguesClient
        .from('cities')
        .select('id, name')
        .in('id', uniqueValuesIds.cities);
        if (cityError) return { status: 500, error: cityError.message };
        result.cities = cities;
    }
    return { status: 200, data: result };
  }
};

export default ubicationService; 