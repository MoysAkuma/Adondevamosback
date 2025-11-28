// Repository isolates all Supabase (DB) calls for trips domain.
class TripsRepository {
  constructor({ tripsClient, usersClient }) {
    this.tripsClient = tripsClient;
    this.usersClient = usersClient;
  }

  async createTrip(payload) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .insert(payload)
      .select()
      .single();
    if (error) return { status: 500, error };
    return { status: 201, data };
  }

  async updateTrip(id, payload) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async deleteTrip(id) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .delete()
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getTripByIdRaw(id) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .select('id,name,ownerid,description,initialdate,finaldate,isinternational')
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getOwnerById(id) {
    const { data, error } = await this.usersClient
      .from('users')
      .select('id,name,lastname,email,tag')
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getItineraryByTripId(tripId, fields = 'id,initialdate,finaldate,placeid') {
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .select(fields)
      .eq('tripid', tripId);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getMembersListByTripId(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .select('id,userid,hide')
      .eq('tripid', tripId);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getUsersByIds(ids, fields = 'id,name,lastname,email') {
    const { data, error } = await this.usersClient
      .from('users')
      .select(fields)
      .in('id', ids);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchTrips(filters = {}, fields = 'id,name,ownerid,initialdate,finaldate') {
    let query = this.tripsClient.from('trips').select(fields);
    Object.entries(filters).forEach(([k, v]) => {
      if (Array.isArray(v)) query = query.in(k, v);
      else query = query.eq(k, v);
    });
    const { data, error } = await query;
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getNewsTrips(limit = 10, fields = 'id,name,initialdate,finaldate') {
    const { data, error } = await this.tripsClient
      .from('trips')
      .select(fields)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchItineraryByTripIDs(tripIds, fields = 'tripid,initialdate,finaldate,placeid') {
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .select(fields)
      .in('tripid', tripIds);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
}

export default TripsRepository;