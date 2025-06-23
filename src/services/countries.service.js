import supabase from '../config/supabase';

const countriesService = {
  async createCountry(insertData) {
    const { data, error } = await supabase
    .from('countries')
    .insert(insertData);

    if (error) throw error;
    return data;
  },

  async updateCountry(countryId, updateData) {
    const { data, error } = await supabase
    .from('countries')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

    if (error) throw error;
    return data;
  },

  async readCountry(countryId) {
    const { data, error } = await supabase
    .from('countries')
    .select("*")
    .eq('id',countryId);

    if (error) throw error;
    return data;
  },

  async deleteCountry(countryId) {
    const { data, error } = await supabase
    .from('countries')
    .delete()
    .eq('id', countryId);

    if (error) throw error;
    return data;
  }
};

export default countriesService;