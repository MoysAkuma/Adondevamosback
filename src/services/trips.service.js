import TripsRepository from '../repositories/trips.repository.js';
import placesService from './places.service.js';
import ubicationService from './ubication.service.js';
import { clientTrips, userClient } from '../config/supabase.js';

const tripsRepo = new TripsRepository({ tripsClient: clientTrips, usersClient: userClient });

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

  async getTripById(tripId) {
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
    const itineraryWithUbicationNames = this.matchUbicationNames({ data: placesList.data }, ubicationNames);

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

    const returnData = {
      id: tripRow.id,
      name: tripRow.name,
      description: tripRow.description,
      initialdate: tripRow.initialdate,
      finaldate: tripRow.finaldate,
      isinternational: tripRow.isinternational,
      itinerary: itineraryWithUbicationNames,
      owner: owner.data[0],
      members: membersEnriched
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
    return await tripsRepo.searchTrips(filters);
  },

  async getNewsTrips(limit = 10) {
    return await tripsRepo.getNewsTrips(limit);
  },

  async searchItineraryByTripIDs(tripIds, fields = 'tripid,initialdate,finaldate,placeid') {
    return await tripsRepo.searchItineraryByTripIDs(tripIds, fields);
  },

  matchUbicationNames(places, ubicationNames) {
    const nameMap = new Map(
      (ubicationNames.data || []).map(u => [u.id, u])
    );
    return (places.data || []).map(p => ({
      ...p,
      ubication: nameMap.get(p.id) || null
    }));
  }
};

export default tripsService;