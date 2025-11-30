// Encapsulates all Supabase access for places.
class PlacesRepository {
  constructor({ placesClient, catalogClient }) {
    this.placesClient = placesClient;
    this.catalogClient = catalogClient;
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

  async getPlaceByIdRaw(id, fields = 'name, countryid, stateid, cityid, description, ispublic, address') {
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
  async getFacilitiesByPlaceId(placeId) {
    const { data, error } = await this.placesClient
      .from('places_facilities')
      .select('facilityid, value')
      .eq('placeid', placeId);
    if (error) return { status: 500, error };
    
    if (!data || data.length === 0) {
      return { status: 200, data: [] };
    }
    const facilityIds = data.map(item => item.facilityid);
    
    const {data: facilitiesData, error: facilitiesError } = await this.catalogClient
      .from('facilities')
      .select('name, code')
      .in('id', facilityIds);

    if (facilitiesError) return { status: 500, error: facilitiesError };

    return { status: 200, data: facilitiesData };
  }
}

export default PlacesRepository;