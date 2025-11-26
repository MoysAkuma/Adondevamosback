import { clientPlaces } from '../config/supabase.js';

const placesService = {
  async getPlaceById(placeId) {
        const { data, error } = await clientPlaces
        .from('places')    
        .select("name, description, countryid, stateid, cityid, address, ispublic")
        .eq('id', placeId);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data };
  },
  async searchPlacesByIDs(placeIds, fields = "id, name, countryid, stateid, cityid") {
      //avoid duplicate place ids
      const uniquePlaceIds = [...new Set(placeIds)];
      //get place list
      const { data, error } = await clientPlaces
        .from('places')
        .select(fields)
        .in('id', uniquePlaceIds);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data || {} };
  }, 
  async searchPlaces(filters) {
    let query = clientPlaces.from('places')
    .select("name, description, countryid, stateid, cityid, address, ispublic")
    .order('createddate', { ascending: false });

    //Apply filters
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
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data || {} };
  }

};

export default placesService;