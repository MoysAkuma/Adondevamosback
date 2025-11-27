import { clientTrips, userClient } from '../config/supabase.js';
import ubicationService from './ubication.service.js';
import placesService from './places.service.js';

const tripsService = {
  async createTrip(CreateTripRq) {
    const { data, error } = await clientTrips
    .from('trips')
    .insert(
      CreateTripRq
    )
    .select()
    .single();

    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  },

  async updateTrip(tripId, UpdateTripRq) {
    const { data, error } = await clientTrips
    .from('trips')
    .update(
      UpdateTripRq
    )
    .eq('id', tripId)
    .select()
    .single();

    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  },

  async getTripById(tripId) {
    //Get info of trip
    const { data, error } = await clientTrips
    .from('trips')    
    .select("name, ownerid, description, initialdate, finaldate, isinternational")
    .eq('id', tripId);
   
    //validate error
    if (error) return { status: 500, error: error.message };

    //If no data found, return empty object
    if (data.length === 0) return { status: 200, data : [] };
    
    //Get owner info
    const {data : ownerInfo, error : errorOwnerInfo} = await userClient
      .from('users')
      .select("id, name, lastname, email, tag")
      .eq('id', data[0].ownerid);
    
    if(ownerInfo.length === 0) return { status: 500, error: 'Owner info not found' };

    if (errorOwnerInfo) return { status: 500, error: ownerInfo.error.message };
    
    //get itinerary
    const { data: dataItinerary, error : errorItinerary } = await clientTrips
    .from('trips_itinerary')
    .select("initialdate, finaldate, placeid")
    .eq('tripid', tripId);

    //get place list from itinerary
    const placeIds = dataItinerary.map( item => item.placeid );
    const placesList = await placesService.searchPlacesByIDs(placeIds, 
      "id, name, countryid, stateid, cityid");
    if (placesList.status == 500) return { status: 500, error: placesList.error };
    
    if (errorItinerary) return { status: 500, error: errorItinerary.message };

    //get ubication names for itinerary places
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(placesList.data);
    
    if (ubicationNames.status == 500) return { status: 500, error: ubicationNames.error };
    
    //map ubication names to itinerary
    const itineraryWithUbicationNames = 
    this.matchUbicationNames({ data: placesList.data }, ubicationNames);
    
    //get member list
    const membersList = await this.getMembersListByTripId(tripId);
    
    if (membersList.status == 500) return { status: 500, error: membersList.error };
    
    //get users info for members
    const memberUserIds = membersList.data.map( member => member.userid );
    
    const ownersInfo = await userClient
      .from('users')
      .select("id, name, lastname, email")
      .in('id', memberUserIds);
    
    if (ownersInfo.error) return { status: 500, error: ownersInfo.error.message };
    
    membersList.data = membersList.data.map( member => {
      return {
        id : member.userid,
        hide : member.hide,
        user : ownersInfo.data.find( user => user.id === member.userid ) || {}
      };
    });
    
    
    //Prepare return data
    const returnData = {
      name : data[0].name,
      description : data[0].description,
      initialdate : data[0].initialdate,
      finaldate : data[0].finaldate,
      isinternational : data[0].isinternational,
      itinerary : itineraryWithUbicationNames,
      owner : {
        id : ownerInfo[0].id,
        name : ownerInfo[0].name,
        lastname : ownerInfo[0].lastname,
        email : ownerInfo[0].email
      },
      members : membersList.data
    };

    return { status: 200, data : returnData };
  },
  async getItineraryByTripId(tripId) {
    const { data, error } = await clientTrips
    .from('trips_itinerary')    
    .select("id, initialdate, finaldate, placeid")
    .eq('tripid', tripId);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  },
  async getMembersListByTripId(tripId) {
    const { data, error } = await clientTrips
    .from('trips_members')
    .select("id, userid, hide")
    .eq('tripid', tripId);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  },

  async deleteTrip(tripId) {
    const { data, error } = await clientTrips
    .from('trips')
    .delete()
    .eq('id', tripId);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  },
  async getAll() {
    const { data, error } = await clientTrips
    .from('trips')
    .select("id, name, ownerid, description, initialdate, finaldate, isinternational")
    .order('createddate', { ascending: false });
    if (error) return { status : 500, error: error.message };
    
    return { status: 200, data : data };
  },
  async searchTrips(filters) {
    
    let searchQuery = clientTrips
    .from('trips')
    .select("id, name, ownerid, description, initialdate, finaldate, isinternational")
    .order('createddate', { ascending: true })
    .limit(5);

    if (filters.name) {
        searchQuery = searchQuery.ilike('name', `%${filters.name}%`);
    }
    if (filters.initialdate) {
        searchQuery = searchQuery.gte('initialdate', filters.initialdate);
    }
    if (filters.finaldate) {
        searchQuery = searchQuery.lte('finaldate', filters.finaldate);
    }

    const { data, error } = await searchQuery;

    if (error) return { status : 500, error: error.message };
    
    return { status: 200, data : data };
  },
  async getNewsTrips() {
    const { data, error } = await clientTrips
    .from('trips')
    .select("id, name, ownerid, description, initialdate, finaldate, isinternational")
    .order('createddate', { ascending: false })
    .limit(3);
    if (error) return { status : 500, error: error.message };

    return { status: 200, data : data };
  },
  async searchItineraryByTripIDs(tripids, 
    fields = "tripid, initialdate, finaldate, placeid") {
    const { data, error } = await clientTrips
    .from('trips_itinerary')
    .select(fields)
    .in('tripid', tripids);
    if (error) return { status : 500, error: error.message };
    return { status: 200, data : data };
  }
  , matchUbicationNames (places, ubicationNames) {
      return places.data.map( place => {
      //find country name
      const country = ubicationNames.data.countries.find( c => c.id === place.countryid);
      const state = ubicationNames.data.states.find( s => s.id === place.stateid);
      const city = ubicationNames.data.cities.find( ci => ci.id === place.cityid);
      return {
          id: place.id,
          name: place.name,
          initialdate: place.initialdate,
          finaldate: place.finaldate,
          Country: country ? 
          { 
              id: country.id, 
              name : country.name, 
              acronym : country.acronym
          } : null,
          State: state ? 
          { 
              id: state.id,
              name : state.name
          } : null,
          City: city ?
          { 
              id: city.id,
              name : city.name
          } : null
      };
    }
  );
  }
};

export default tripsService;