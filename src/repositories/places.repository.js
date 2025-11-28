// Encapsulates all Supabase access for places.
class PlacesRepository {
  constructor({ placesClient }) {
    this.placesClient = placesClient;
  }

  async createPlace(payload) {
    const { data, error } = await this.placesClient
      .from('places')
      .insert(payload)
      .select()
      .single();
    if (error) return { status: 500, error };
    return { status: 201, data };
  }

  async updatePlace(id, payload) {
    const { data, error } = await this.placesClient
      .from('places')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async deletePlace(id) {
    const { data, error } = await this.placesClient
      .from('places')
      .delete()
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getPlaceByIdRaw(id, fields = 'id,name,countryid,stateid,cityid') {
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    if (!Array.isArray(ids) || ids.length === 0) return { status: 200, data: [] };
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .in('id', ids);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid') {
    let query = this.placesClient.from('places').select(fields);
    Object.entries(filters).forEach(([k, v]) => {
      if (Array.isArray(v)) query = query.in(k, v);
      else query = query.eq(k, v);
    });
    const { data, error } = await query;
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
}

export default PlacesRepository;