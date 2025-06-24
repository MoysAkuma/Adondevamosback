import cataloguesClient from '../config/supabase.js';

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

    if (error) throw error;
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
  async getAll(page = 10,limit = 10, skip = 0) {
    const { data, error } = await cataloguesClient
    .from('countries')
    .select("*")
    .limit(limit)
    .skip(skip);

    if (error) throw error;
    return data;
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