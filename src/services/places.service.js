import PlacesRepository from '../repositories/places.repository.js';
import { clientPlaces } from '../config/supabase.js'; // adjust to your actual supabase client export

const placesRepo = new PlacesRepository({ placesClient: clientPlaces });

const placesService = {
  async createPlace(rq) {
    return await placesRepo.createPlace(rq);
  },

  async updatePlace(id, rq) {
    return await placesRepo.updatePlace(id, rq);
  },

  async deletePlace(id) {
    return await placesRepo.deletePlace(id);
  },

  async getPlaceById(id) {
    const base = await placesRepo.getPlaceByIdRaw(id);
    if (base.status !== 200) return base;
    if (!base.data || base.data.length === 0) return { status: 404, data: null };
    return { status: 200, data: base.data[0] };
  },

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    return await placesRepo.searchPlacesByIDs(ids, fields);
  },

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid') {
    return await placesRepo.searchPlaces(filters, fields);
  }
};

export default placesService;