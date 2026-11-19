import exceptions from '../middleware/exceptions.middleware.js';

class cataloguesRepository {
    constructor({ cataloguesClient }) {
        this.cataloguesClient = cataloguesClient;
    }
    async getAllCountries(fields = 'id, name, acronym, originalname, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('countries')
            .select(fields)
            .order('name', { ascending: true });

        const { data, error } = await query;

        if (error) throw exceptions.internal(error.message);
        return data;
    }   
    async getAllStates(fields = 'id, name, countryid,originalname, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('states')
            .select(fields)
            .order('countryid', { ascending: true });

        const { data, error } = await query;

        if (error) throw exceptions.internal(error.message);
        return data;
    }   
    async getAllCities(fields = 'id, name, stateid, countryid, originalname, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('cities')
            .select(fields)
            .order('countryid', { ascending: true });
        const { data, error } = await query;

        if (error) throw exceptions.internal(error.message);
        return data;
    }
    async getAllFacilities(fields = 'id, name,code, hide') {
        const { data, error } = await this.cataloguesClient
            .from('facilities')
            .select(fields)
            .order('id', { ascending: true });

        if (error) throw exceptions.internal(error.message);
        return data;
    }
    async updateFacilityField(data, id) {
        const { error } = await this.cataloguesClient
            .from('facilities')
            .update(data)
            .eq('id', id);
        if (error) throw exceptions.internal(error.message);
    }
    async updateCountryField(data, id) {
        const { error } = await this.cataloguesClient
            .from('countries')
            .update(data)
            .eq('id', id);
        if (error) throw exceptions.internal(error.message);
    }
    async updateStateField(data, id) {
        const { error } = await this.cataloguesClient
            .from('states')
            .update(data)
            .eq('id', id);
        if (error) throw exceptions.internal(error.message);
    }
    async updateCityField(data, id) {
        const { error } = await this.cataloguesClient
            .from('cities')
            .update(data)
            .eq('id', id);
        if (error) throw exceptions.internal(error.message);
    }
    async createCountry(data) {
        const { data: insertedData, error } = await this.cataloguesClient
            .from('countries')
            .insert(data)
            .select();
        if (error) throw exceptions.internal(error.message);
        return insertedData;
    }
    async createState(data) {
        const { data: insertedData, error } = 
        await this.cataloguesClient
            .from('states')
            .insert(data)
            .select();
        
        if (error) throw exceptions.internal(error.message);
        return insertedData;
    }
    async createCity(data) {
        const { data: insertedData, error } = await this.cataloguesClient
            .from('cities')
            .insert(data)
            .select();
        if (error) throw exceptions.internal(error.message);
        return insertedData;
    }
    async createFacility(data) {
        const { data: insertedData, error } = await this.cataloguesClient
            .from('facilities')
            .insert(data)
            .select();
        if (error) throw exceptions.internal(error.message);
        return insertedData;
    }
    async findOne({ tableName, id }) {
        const { data, error } = await this.cataloguesClient
            .from(tableName)
            .select()
            .eq('id', id)
            .maybeSingle();
        if (error) throw exceptions.internal(error.message);
        return data;
    }
};

export default cataloguesRepository;