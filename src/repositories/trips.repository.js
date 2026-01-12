// Repository isolates all Supabase (DB) calls for trips domain.
class TripsRepository {
  constructor({ tripsClient, usersClient, votesClient }) {
    this.tripsClient = tripsClient;
    this.usersClient = usersClient;
    this.votesClient = votesClient;
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

  async getItineraryByTripId(tripId, 
    fields = 'id,initialdate,finaldate,placeid') {
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

  async getUsersByIds(ids, fields = 'id,name,lastname,email,tag') {
    const { data, error } = await this.usersClient
      .from('users')
      .select(fields)
      .in('id', ids);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchTrips(filters = {}, fields = 'id,name,ownerid,initialdate,finaldate') {
    let query = this.tripsClient.from('trips').select(fields);
    
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    
    if (filters.ownerid) {
      query = query.eq('ownerid', filters.ownerid);
    }

    if (filters.initialdate) {
      query = query.gte('initialdate', filters.initialdate);
    }

    if (filters.finaldate) {
      query = query.lte('finaldate', filters.finaldate);
    }
    
    const { data, error } = await query;
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getNewsTrips(limit = 5, 
    fields = 'id,name,initialdate,finaldate') {
    const { data, error } = await this.tripsClient
      .from('trips')
      .select(fields)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchItineraryByTripIDs(tripIds, 
    fields = 'tripid,initialdate,finaldate,placeid') {
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .select(fields)
      .in('tripid', tripIds);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
  async getVotesSummaryByTripId(tripId) {
    const { data, error } = await 
    this.votesClient
      .from('trips')
      .select('value')
      .eq('tripid', tripId)
      .eq('value', true);
    if (error) return { status: 500, error };
    const total = data ? data.length : 0;
    return { status: 200, data: [{ total }] };
  }
  async getUserVoteByTripIdAndUserId(tripId, userId) {
    const {data, error} = await 
    this.votesClient
      .from('trips')
      .select('value')
      .eq('tripid', tripId)
      .eq('userid', userId)
      .eq('value', true);

    if (error) return { status: 500, error };
    if (!data || data.length === 0) {
      return { status: 200, data: { value: false } };
    }
    return { status: 200, data: { value: true } };
  }
  async createItinerary(tripId, itineraryData) {
    const payload = itineraryData.map(item => ({
      initialdate: item.initialdate,
      finaldate: item.finaldate,
      placeid: item.placeid
    }));
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .insert(
        payload.map(item => ({ ...item, 
          tripid: tripId }))
      )
      .select();
    if (error) return { status: 500, error };
    return { status: 201, data };
  }
  
  async deleteItineraryItem(id) {
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .delete()
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
  async createMemberList(tripId, membersData) {
    const payload = membersData.map(item => ({
      userid: item.userid,
      hide: item.hide || false
    }));
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .insert(
        payload.map(item => ({ ...item, 
          tripid: tripId }))
      )
      .select();
    if (error) return { status: 500, error };
    return { status: 201, data };
  }
  async deleteMemberItem(id) {
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .delete()
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
  async getMembersListByTripIds(tripIds) {
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .select('id,tripid,userid,hide')
      .in('tripid', tripIds);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
}

export default TripsRepository;