import {clientTrips} from '../config/supabase.js';

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
    const { data, error } = await clientTrips
    .from('trips')    
    .select("name, ownerid, description, initialdate, finaldate, isinternational")
    .eq('id', tripId);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
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
};

export default tripsService;