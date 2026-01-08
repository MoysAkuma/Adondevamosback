// Encapsulates all Supabase access for places.
class PlacesRepository {
  constructor({ placesClient, catalogClient, votesClient }) {
    this.placesClient = placesClient;
    this.catalogClient = catalogClient;
    this.votesClient = votesClient;
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

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid,address') {
    let query = 
    this.placesClient.from('places').select(fields).limit(5);
    
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.countryid) {
      query = query.eq('countryid', filters.countryid);
    }
    if (filters.stateid) {
      query = query.eq('stateid', filters.stateid);
    }
    if (filters.cityid) {
      query = query.eq('cityid', filters.cityid);
    }
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
  async getVotesByPlaceIdSummary(placeId) {
    
    const { data, error } = 
    await this.votesClient
      .from('places')
      .select('value')
      .eq('placeid', placeId)
      .eq('value', true);
    if (error) return { status: 500, error: error.message };
    const total = data ? data.length : 0;
    return { status: 200, data: [{ total : total }] };
  }
  async getUserVoteByPlaceIdAndUserId(placeId, userId) {
    const {data, error} = await 
    this.votesClient
      .from('places')
      .select('id,value')
      .eq('placeid', placeId)
      .eq('userid', userId)
      .eq('value', true);
    
    if (error) return { status: 500, error };
    if (!data || data.length === 0) {
      return { status: 200, data: { value: false } };
    }
    return { status: 200, data: { value: true } };
  }
}

export default PlacesRepository;