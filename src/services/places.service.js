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
  // Helper method to enrich place data with full details
  async _enrichPlaceWithFullDetails(placeId, userid = null) {
    const base = await placesRepo.getPlaceByIdRaw(placeId);
    if (base.status !== 200) return base;
    
    if (!base.data || base.data.length === 0) return { status: 404, data: null };
    
    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(base.data);
    
    if (ubicationNames.status !== 200) return ubicationNames;
    const placeWithUbicationNames = mapPlacesWithUbicationNames(base.data, ubicationNames.data);
    
    //get facilities
    const facilities = await placesRepo.getFacilitiesByPlaceId(placeId);
    
    if (facilities.status !== 200) return facilities;

    //unset countryid, stateid, cityid from placeWithUbicationNames
    placeWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });

    placeWithUbicationNames[0].facilities = facilities.data;
    
    //get votes
    const votes = await placesRepo.getVotesByPlaceIdSummary(placeId);
    if (votes.status !== 200) return votes;
    placeWithUbicationNames[0].statics = {
        Votes: {
          Total: votes.data[0].total
        }
      };
    //validate if user has voted place
    let userVote = { status: 200, data: { value: false } };
    if (userid) {
      userVote = await placesRepo.getUserVoteByPlaceIdAndUserId(placeId, userid);
      if (userVote.status !== 200) return userVote;
    }
    
    placeWithUbicationNames[0].userVote = userVote.data.value;

    //get gallery
    const gallery = await placesRepo.getGalleryByPlaceId(placeId);
    if (gallery.status !== 200) return gallery;
    placeWithUbicationNames[0].gallery = gallery.data;

    return { status: 200, data: { ...placeWithUbicationNames[0], id: placeId } };
  },

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
    return await this._enrichPlaceWithFullDetails(id, userid);
  },

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    return await placesRepo.searchPlacesByIDs(ids, fields);
  },

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid,address') {
    const base = await placesRepo.searchPlaces(filters, fields);
    
    if (base.status !== 200) return base;
    if (!base.data || base.data.length === 0) return { status: 404 , message: "No results to show" };
    
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
    if (!base.data || base.data.length === 0) return { status: 404, message: "No results to show" };
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
  },
  async uploadImages(placeId, images) {
    //verify place exists
    const place = await placesRepo.getPlaceByIdRaw(placeId, 'id');
    if (place.status !== 200) return place;

    //save images in bucket
    const saveUploadedFiles = 
     await placesRepo.uploadImagesToStorage(placeId, images);
    if (saveUploadedFiles.status !== 200) {
      return saveUploadedFiles;
    }

    //save image urls in place record
    return await placesRepo.saveImageUrlsToPlace(placeId, saveUploadedFiles.data);
  },
  async updateFacilities(placeId, facilitiesData) {
    //verify place exists
    const place = await placesRepo.getPlaceByIdRaw(placeId, 'id');
    if (place.status !== 200) return place;
    if (!place.data || place.data.length === 0) {
      return { status: 404, error: 'Place not found' };
    }
    return await placesRepo.updateFacilities(placeId, facilitiesData);
  },
  async addFacilities(placeId, facilitiesData) {
    //verify place exists
    const place = await placesRepo.getPlaceByIdRaw(placeId, 'id');
    if (place.status !== 200) return place;
    if (!place.data || place.data.length === 0) {
      return { status: 404, error: 'Place not found' };
    }
    return await placesRepo.addFacilities(placeId, facilitiesData);
  }, 
  async getNewPlaces(limit = 10, userid = null) {
    const result = await placesRepo.getNewPlaces(limit);
    if (result.status !== 200) return result;
    if (!result.data || result.data.length === 0) return { status: 200, data: [] };
    
    // Enrich each place with full details
    const enrichedPlaces = await Promise.all(
      result.data.map(place => this._enrichPlaceWithFullDetails(place.id, userid))
    );
    
    // Filter out any errors and extract data
    const successfulPlaces = enrichedPlaces
      .filter(p => p.status === 200)
      .map(p => p.data);
    
    return { status: 200, data: successfulPlaces };
  },
  
  async deleteImage(placeId, imageId) {
    // Verify place exists
    const place = await placesRepo.getPlaceByIdRaw(placeId, 'id');
    if (place.status !== 200) return place;
    if (!place.data || place.data.length === 0) {
      return { status: 404, error: 'Place not found' };
    }
    
    return await placesRepo.deleteImageFromGallery(imageId);
  }
};

export default placesService;