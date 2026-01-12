import PlacesRepository from '../repositories/places.repository.js';
import { mapPlacesWithUbicationNames } from '../mappers/ubication.mapper.js';
import ubicationService from './ubication.service.js';
import { clientPlaces, cataloguesClient, votesClient } from '../config/supabase.js'; // adjust to your actual supabase client export

const placesRepo = new PlacesRepository(
  { 
    placesClient: clientPlaces, 
    catalogClient: cataloguesClient,
    votesClient: votesClient 
  });

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

  async getPlaceById(id, userid = null) {
    const base = await placesRepo.getPlaceByIdRaw(id);
    if (base.status !== 200) return base;
    
    if (!base.data || base.data.length === 0) return { status: 404, data: null };
    
    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(base.data);
    
    if (ubicationNames.status !== 200) return ubicationNames;
    const placeWithUbicationNames = mapPlacesWithUbicationNames(base.data, ubicationNames.data);
    
    //get facilities
    const facilities = await placesRepo.getFacilitiesByPlaceId(id);

    if (facilities.status !== 200) return facilities;

    //unset countryid, stateid, cityid from placeWithUbicationNames
    placeWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });

    placeWithUbicationNames[0].facilities = facilities.data;
    
    //get votes
    const votes = await placesRepo.getVotesByPlaceIdSummary(id);
    if (votes.status !== 200) return votes;
    placeWithUbicationNames[0].statics = {
        Votes: {
          Total: votes.data[0].total
        }
      };
    //validate if user has voted place
    let userVote = { status: 200, data: { value: false } };
    if (userid) {
      
      userVote = 
      await placesRepo.getUserVoteByPlaceIdAndUserId(id, userid);
      if (userVote.status !== 200) return userVote;
    }
    
    placeWithUbicationNames[0].userVote = userVote.data.value;

    return { status: 200, data: placeWithUbicationNames[0] };
  },

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    return await placesRepo.searchPlacesByIDs(ids, fields);
  },

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid,address') {
    const base = await placesRepo.searchPlaces(filters, fields);
    if (base.status !== 200) return base;
    if (!base.data || base.data.length === 0) return { status: 200, data: [] };

    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(base.data);
    if (ubicationNames.status !== 200) return ubicationNames;
    const placesWithUbicationNames = mapPlacesWithUbicationNames(base.data, ubicationNames.data);

    //unset countryid, stateid, cityid from placesWithUbicationNames
    placesWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });
    return { status: 200, data: placesWithUbicationNames };
  },
  async searchPlacesByField(field, name, 
    fields = 'id,name,countryid,stateid,cityid') {
    
    const base = await placesRepo.searchPlacesByField(field, name, fields);
    
    if (base.status !== 200) return base;
    if (!base.data || base.data.length === 0) return { status: 200, data: [] };
    //get ubication names
    const ubicationNames = 
    await ubicationService.getUbicationNamesByIDs(base.data);
    if (ubicationNames.status !== 200) return ubicationNames;
    const placesWithUbicationNames = mapPlacesWithUbicationNames(base.data, ubicationNames.data);
    //unset countryid, stateid, cityid from placesWithUbicationNames
    placesWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });
    return { status: 200, data: placesWithUbicationNames };
  }
};

export default placesService;