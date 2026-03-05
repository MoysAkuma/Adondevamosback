import TripsRepository from '../repositories/trips.repository.js';
import placesService from './places.service.js';
import ubicationService from './ubication.service.js';
import { clientTrips, userClient, votesClient } from '../config/supabase.js';
import { mapPlacesWithUbicationNames } from '../mappers/ubication.mapper.js';

const tripsRepo = new TripsRepository(
  { 
    tripsClient: clientTrips, 
    usersClient: userClient,
    votesClient: votesClient
  }
);

const tripsService = {
  async createTrip(createTripRq) {
    return await tripsRepo.createTrip(createTripRq);
  },

  async updateTrip(tripId, updateTripRq) {
    return await tripsRepo.updateTrip(tripId, updateTripRq);
  },

  async deleteTrip(tripId) {
    return await tripsRepo.deleteTrip(tripId);
  },

  async uploadImages(tripId, images) {
    // Verify trip exists
    const tripExists = await tripsRepo.getTripByIdRaw(tripId);
    if (tripExists.status !== 200 || !tripExists.data || tripExists.data.length === 0) {
      return { status: 404, error: 'Trip not found' };
    }

    const saveUploadedFiles =
     await tripsRepo.uploadImagesToStorage(tripId, images);
    if (saveUploadedFiles.status !== 200) {
      return saveUploadedFiles;
    }
    const saveImageUrls =
     await tripsRepo.saveImageUrlsToTrip(tripId, saveUploadedFiles.data);
    return saveImageUrls;
  },

  async getTripById(tripId, userid = null) {
    // base trip
    const base = await tripsRepo.getTripByIdRaw(tripId);
    if (base.status !== 200) return base;
    if (!base.data || base.data.length === 0) return { status: 404, data: null };

    const tripRow = base.data[0];

    // owner
    const owner = await tripsRepo.getOwnerById(tripRow.ownerid);
    if (owner.status !== 200) return owner;
    if (!owner.data || owner.data.length === 0) return { status: 404, data: null };

    // itinerary raw
    const itinerary = await tripsRepo.getItineraryByTripId(tripId);
    if (itinerary.status !== 200) return itinerary;

    // place IDs
    const placeIds = (itinerary.data || []).map(i => i.placeid);
    let placesList = { status: 200, data: [] };
    if (placeIds.length > 0) {
      placesList = await placesService.searchPlacesByIDs(placeIds, 'id,name,countryid,stateid,cityid');
      if (placesList.status !== 200) return placesList;
    }

    // ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(placesList.data);
    if (ubicationNames.status !== 200) return ubicationNames;

    // map itinerary with ubication names
    const itineraryWithUbicationNames = mapPlacesWithUbicationNames(placesList.data, ubicationNames.data);
    
    //combine itinerary data with place and ubication info
    itinerary.data = (itinerary.data || []).map(item => {
      const placeInfo = itineraryWithUbicationNames.find(p => p.id === item.placeid);
      itineraryWithUbicationNames.forEach(place => {
        delete place.countryid;
        delete place.stateid;
        delete place.cityid;
      });
      return {
        initialdate: item.initialdate,
        finaldate: item.finaldate,
        place: placeInfo
      };
    });
    
    // members
    const membersList = await tripsRepo.getMembersListByTripId(tripId);
    if (membersList.status !== 200) return membersList;

    // member user details
    const memberUserIds = (membersList.data || []).map(m => m.userid);
    let usersInfo = { status: 200, data: [] };
    if (memberUserIds.length > 0) {
      usersInfo = await tripsRepo.getUsersByIds(memberUserIds);
      if (usersInfo.status !== 200) return usersInfo;
    }

    // attach user info to members
    const userMap = new Map(usersInfo.data.map(u => [u.id, u]));
    const membersEnriched = (membersList.data || []).map(m => ({
      id: m.id,
      hide: m.hide,
      userid: m.userid,
      user: userMap.get(m.userid) || null
    }));
    
    //get votes summary
    const votesSummary = await tripsRepo.getVotesSummaryByTripId(tripId);
    if (votesSummary.status !== 200) return votesSummary;
    
    //validate if the user has voted
    let userVote = { status: 200, data: { value: false } };
    if (userid) {
      console.log(`Checking if user ${userid} has voted for trip ${tripId}`);
      userVote = await tripsRepo.getUserVoteByTripIdAndUserId(tripId, userid);
      if (userVote.status !== 200) return userVote;
    }

    //get gallery images
    const galleryImages = await tripsRepo.getTripImages(tripId);
    if (galleryImages.status !== 200) return galleryImages;
    
    const returnData = {
      id: tripRow.id,
      name: tripRow.name,
      description: tripRow.description,
      initialdate: tripRow.initialdate,
      finaldate: tripRow.finaldate,
      isinternational: tripRow.isinternational,
      itinerary: itinerary.data,
      owner: owner.data[0],
      members: membersEnriched,
      statics: {
        Votes: {
          Total: votesSummary.data[0].total
        }
      },
      userVoted: userVote.data.value || false,
      gallery : galleryImages.data || []
    };

    return { status: 200, data: returnData };
  },

  async getItineraryByTripId(tripId) {
    return await tripsRepo.getItineraryByTripId(tripId);
  },

  async getMembersListByTripId(tripId) {
    return await tripsRepo.getMembersListByTripId(tripId);
  },

  async getAll(filters = {}) {
    return await tripsRepo.searchTrips(filters, 'id,name,ownerid,initialdate,finaldate');
  },

  async searchTrips(filters) {
    //get trip list
    const foundedTrips = await tripsRepo.searchTrips(filters, 
      'id,name,description,initialdate,finaldate,isinternational,ownerid');
    if( foundedTrips.status != 200 ) {
      return ApiError("trips search error", foundedTrips.status )
    }
    //get owners info
    const ownerIds = [...new Set(foundedTrips.data.map(trip => trip.ownerid))];
    const ownersInfo = await tripsRepo.getUsersByIds(ownerIds, 'id,name,lastname,email,tag');
    if(ownersInfo.status != 200){
      return ApiError("owners info error", ownersInfo.status )
    }
    const ownerMap = new Map(ownersInfo.data.map(o => [o.id, o]));
    //attach owner info to trips
    foundedTrips.data = foundedTrips.data.map(trip => ({
      ...trip,
      owner: ownerMap.get(trip.ownerid) || null
    }));
    
    return { status: 200, data: foundedTrips.data };
  },

  async getNewsTrips(limit = 5, userId = null) {
    const result = await tripsRepo.getNewsTrips(limit, 'id');
    
    if (result.status !== 200) {
      return result;
    }
    
    //get info of trips
    let resultsToReturn = await Promise.all(
      result.data.map(trip => this.getTripById(trip.id, userId))
    );

    return { status: 200, data: resultsToReturn.map(r => r.data) }; 
  },

  async searchItineraryByTripIDs(tripIds, fields = 'tripid,initialdate,finaldate,placeid') {
    return await tripsRepo.searchItineraryByTripIDs(tripIds, fields);
  },
  async createItinerary(tripId, itineraryData) {
    return await tripsRepo.createItinerary(tripId, itineraryData);
  },
  async updateItinerary(tripId, itineraryData) {
    //get existing itinerary
    const existingItinerary = await tripsRepo.getItineraryByTripId(tripId);
    
    if (existingItinerary.status !== 200) return existingItinerary;
    
    //delete existing itinerary entries
    for (const item of existingItinerary.data) {
      await tripsRepo.deleteItineraryItem(item.id);
    }
    if (itineraryData.length === 0) {
      return { status: 201, data: [] };
    }
    return await tripsRepo.createItinerary(tripId, itineraryData);
  },
  async createMemberList(tripId, membersData) {
    return await tripsRepo.createMemberList(tripId, membersData);
  },
  async updateMemberList(tripId, membersData) {
    //get existing members list
    const existingMembers = 
    await tripsRepo.getMembersListByTripIds([tripId]);
    if (existingMembers.status !== 200) return existingMembers;
    
    //delete existing members entries
    for (const item of existingMembers.data) {
      await tripsRepo.deleteMemberItem(item.id);
    }
    if (membersData.length === 0) {
      return { status: 201, data: [] };
    }
    return await tripsRepo.createMemberList(tripId, membersData);
  },
  
  async deleteImage(tripId, imageId) {
    // Verify trip exists
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (trip.status !== 200) return trip;
    if (!trip.data || trip.data.length === 0) {
      return { status: 404, error: 'Trip not found' };
    }
    
    return await tripsRepo.deleteImageFromGallery(imageId);
  }
};

export default tripsService;