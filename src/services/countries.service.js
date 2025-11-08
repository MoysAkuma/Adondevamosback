import { cataloguesClient} from '../config/supabase.js';

const countriesService = {
  async createCountry(insertData) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .insert(insertData)
    .select();

    if (error) throw error;
    return data;
  },

  async updateCountry(countryId, updateData) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .update(updateData)
    .eq('id', countryId)
    .select()
    .single();

    if (error) throw error;
    return data;
  },

  async getCountryById(countryId) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .select("*")
    .eq('id',countryId);
    console.log(data);
    if (error) throw error;
    console.log(error);
    return data;
  },

  async deleteCountry(countryId) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .delete()
    .eq('id', countryId);

    if (error) throw error;
    return data;
  },
  async getAll(startIndex = 0, endIndex = 10 ) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .select("id, name, originalname, acronym, enabled, hide, createddate")
    .order('createddate', { ascending: true })
    .range(startIndex, endIndex);
    
    console.log(data);
    if (error) return ({ status : 500, error: error.message});
    
    return { status: 200, data : data };
  },
  async setVisibilityCountry(countryId, hide=true) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .update({ hide : hide })
    .eq('id', countryId)
    .select()
    .single();

    if (error) throw error;
    return data;
  },
};

export default countriesService;