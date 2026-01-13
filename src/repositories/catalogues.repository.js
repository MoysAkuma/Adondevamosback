class cataloguesRepository {
    constructor({ cataloguesClient }) {
        this.cataloguesClient = cataloguesClient;
    }
    async getAllCountries(fields = 'id, name, acronym') {
        const { data, error } = await this.cataloguesClient
            .from('countries')
            .select(fields);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }   
    async getAllStates(fields = 'id, name, countryid') {
        const { data, error } = await this.cataloguesClient
            .from('states')
            .select(fields);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }   
    async getAllCities(fields = 'id, name, stateid') {
        const { data, error } = await this.cataloguesClient
            .from('cities')
            .select(fields);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
    async getAllFacilities(fields = 'id, name,code') {
        const { data, error } = await this.cataloguesClient
            .from('facilities')
            .select(fields);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
};

export default cataloguesRepository;