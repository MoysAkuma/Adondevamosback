class cataloguesRepository {
    constructor({ cataloguesClient }) {
        this.cataloguesClient = cataloguesClient;
    }
    async getAllCountries(fields = 'id, name, acronym, originalname, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('countries')
            .select(fields)
            .order('name', { ascending: true });

        let { data, error } = await query;
                
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }   
    async getAllStates(fields = 'id, name, countryid,originalname, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('states')
            .select(fields)
            .order('countryid', { ascending: true });

        let { data, error } = await query;
        
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }   
    async getAllCities(fields = 'id, name, stateid, countryid, originalname, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('cities')
            .select(fields)
            .order('countryid', { ascending: true });
        let { data, error } = await query;
        
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
    async getAllFacilities(fields = 'id, name,code, hide', showHidden = false) {
        let query = this.cataloguesClient
            .from('facilities')
            .select(fields)
            .order('id', { ascending: true });
        let { data, error } = await query;
        
        if (!showHidden) {
            data = data.filter(facility => !facility.hide);
        }
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: data };
    }
    async updateFacilityField(data, id) {
        const { error } = await this.cataloguesClient
            .from('facilities')
            .update(data)
            .eq('id', id);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: "Facility updated successfully" };
    }
    async updateCountryField(data, id) {
        const { error } = await this.cataloguesClient
            .from('countries')
            .update(data)
            .eq('id', id);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: "Country updated successfully" };
    }
    async updateStateField(data, id) {
        const { error } = await this.cataloguesClient
            .from('states')
            .update(data)
            .eq('id', id);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: "State updated successfully" };
    }
    async updateCityField(data, id) {
        const { error } = await this.cataloguesClient
            .from('cities')
            .update(data)
            .eq('id', id);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data: "City updated successfully" };
    }
    async createCountry(data) {
        const { data: insertedData, error } = await this.cataloguesClient
            .from('countries')
            .insert(data)
            .select();
        if (error) return { status: 500, error: error.message };
        return { status: 201, data: insertedData };
    }
    async createState(data) {
        const { data: insertedData, error } = 
        await this.cataloguesClient
            .from('states')
            .insert(data)
            .select();
        
        if (error) return { status: 500, error: error.message };
        return { status: 201, data: insertedData };
    }
    async createCity(data) {
        const { data: insertedData, error } = await this.cataloguesClient
            .from('cities')
            .insert(data)
            .select();
        if (error) return { status: 500, error: error.message };
        return { status: 201, data: insertedData };
    }
    async createFacility(data) {
        const { data: insertedData, error } = await this.cataloguesClient
            .from('facilities')
            .insert(data)
            .select();
        if (error) return { status: 500, error: error.message };
        return { status: 201, data: insertedData };
    }
};

export default cataloguesRepository;