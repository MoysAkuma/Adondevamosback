import clientTrips from '../config/supabase.js';

const tripsService = {
  async createTrip(CreateTripRq) {
    const { data, error } = await clientTrips
    .from('trips')
    .insert(
      CreateTripRq
    )
    .select()
    .single();

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  },

  async getTripById(tripId) {
    const { data, error } = await clientTrips
    .from('trips')    
    .select("*")
    .eq('id',countryId);

    if (error) throw error;
    return data;
  },

  async deleteTrip(tripId) {
    const { data, error } = await clientTrips
    .from('trips')
    .delete()
    .eq('id', tripId);

    if (error) throw error;
    return data;
  },
  async getAll(page = 10,limit = 10, skip = 0) {
    const { data, error } = await clientTrips
    .from('trips')
    .select("*")
    .limit(limit)
    .skip(skip);
    
    console.log(data);
    if (error) return ({ status : 500, error: error.message});
    
    return { status: 200, data : data };
  }
};

export default tripsService;