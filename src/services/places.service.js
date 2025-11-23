import { clientPlaces } from '../config/supabase.js';

const placesService = {
  async getPlaceById(placeId) {
        const { data, error } = await clientPlaces
        .from('places')    
        .select("name, description, location, category, imageurl")
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
  }

};

export default placesService;