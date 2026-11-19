import exceptions from '../middleware/exceptions.middleware.js';

const STORAGE_BUCKET = 'adondevamosNoGallery';

// Repository isolates all Supabase (DB and storage) calls for trips domain.
class TripsRepository {
  constructor({ tripsClient, usersClient, votesClient, placesClient }) {
    this.tripsClient = tripsClient;
    this.usersClient = usersClient;
    this.votesClient = votesClient;
    this.placesClient = placesClient;
  }

  async createTrip(payload) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .insert(payload)
      .select()
      .single();
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async updateTrip(id, payload) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async deleteTrip(id) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .delete()
      .eq('id', id);
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getTripByIdRaw(id, fields = 'id,name,cover_url,ownerid,description,initialdate,finaldate,isinternational,orden') {
    const fallbackFields = 'id,name,cover_url,ownerid,description,initialdate,finaldate,isinternational';
    const primary = await this.tripsClient
      .from('trips')
      .select(fields)
      .eq('id', id);

    if (!primary.error) {
      return primary.data?.[0] ?? null;
    }

    if (String(primary.error.message || '').includes('orden')) {
      const fallback = await this.tripsClient
        .from('trips')
        .select(fallbackFields)
        .eq('id', id);

      if (fallback.error) throw exceptions.internal(fallback.error.message);
      return fallback.data?.[0] ?? null;
    }

    throw exceptions.internal(primary.error.message);
  }

  async getOwnerById(id) {
    const { data, error } = await this.usersClient
      .from('users')
      .select('id,name,lastname,email,tag')
      .eq('id', id);
    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async getItineraryByTripId(tripId, 
    fields = 'id,initialdate,finaldate,placeid,orden') {
    const fallbackFields = 'id,initialdate,finaldate,placeid';
    const primary = await this.tripsClient
      .from('trips_itinerary')
      .select(fields)
      .eq('tripid', tripId)
      .order('orden', { ascending: true });

    if (!primary.error) {
      return primary.data;
    }

    if (String(primary.error.message || '').includes('orden')) {
      const fallback = await this.tripsClient
        .from('trips_itinerary')
        .select(fallbackFields)
        .eq('tripid', tripId);

      if (fallback.error) throw exceptions.internal(fallback.error.message);
      return fallback.data;
    }

    throw exceptions.internal(primary.error.message);
  }

  async getMembersListByTripId(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .select('id,userid,hide')
      .eq('tripid', tripId);
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getUsersByIds(
    ids, 
    fields = 'id,name,lastname,email,tag',
    userId = null
  ) {
    const { data, error } = await this.usersClient
      .from('users')
      .select(fields)
      .in('id', ids);
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getTripIdsByFilters(filters = {}, userId = null) {
    let tripIds = null;

    if (filters.countryid || filters.stateid || filters.cityid) {
      let placesQuery = this.placesClient.from('places').select('id');

      if (filters.countryid) {
        placesQuery = placesQuery.eq('countryid', filters.countryid);
      }

      if (filters.stateid) {
        placesQuery = placesQuery.eq('stateid', filters.stateid);
      }

      if (filters.cityid) {
        placesQuery = placesQuery.eq('cityid', filters.cityid);
      }

      const { data: placesData, error: placesError } = await placesQuery;
      if (placesError) throw exceptions.internal(placesError.message);

      const placeIds = (placesData || []).map(place => place.id);
      if (placeIds.length === 0) return [];

      const { data: itineraryData, error: itineraryError } = await this.tripsClient
        .from('trips_itinerary')
        .select('tripid')
        .in('placeid', placeIds);

      if (itineraryError) throw exceptions.internal(itineraryError.message);

      tripIds = [...new Set((itineraryData || []).map(item => item.tripid))];
    }

    if (filters.membertrips) {
      const { data: memberTripsData, error: memberTripsError } = await this.tripsClient
        .from('trips_members')
        .select('tripid')
        .eq('userid', userId);

      if (memberTripsError) throw exceptions.internal(memberTripsError.message);

      const memberTripIds = [...new Set((memberTripsData || []).map(item => item.tripid))];
      tripIds = tripIds
        ? tripIds.filter(id => memberTripIds.includes(id))
        : memberTripIds;
    }

    return tripIds;
  }

  applyTripFilters(query, filters = {}, userId = null, tripIds = null) {
    if (tripIds) {
      query = query.in('id', tripIds);
    }

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }

    if (filters.initialdate) {
      query = query.gte('initialdate', filters.initialdate);
    }

    if (filters.finaldate) {
      query = query.lte('finaldate', filters.finaldate);
    }

    if (filters.ownerid) {
      query = query.eq('ownerid', filters.ownerid);
    }

    if (filters.mytrips) {
      query = query.eq('ownerid', userId);
    }

    return query;
  }

  async countTrips(filters = {}, userId = null) {
    const tripIds = await this.getTripIdsByFilters(filters, userId);
    if (tripIds && tripIds.length === 0) return 0;

    const countQuery = this.applyTripFilters(
      this.tripsClient.from('trips').select('id', { count: 'exact', head: false }),
      filters,
      userId,
      tripIds
    );

    const { count, error } = await countQuery;
    if (error) throw exceptions.internal(error.message);
    return count || 0;
  }

  async searchTrips(filters = {}, 
    fields = 'id,name,ownerid,initialdate,finaldate,orden', 
    userId = null,
    page = 1,
    limit = 10) {

    const tripIds = await this.getTripIdsByFilters(filters, userId);
    if (tripIds && tripIds.length === 0) return [];

    let query = this.applyTripFilters(
      this.tripsClient.from('trips').select(fields),
      filters,
      userId,
      tripIds
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('createddate', { ascending: false }).range(from, to);

    const { data, error } = await query;
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async getNewsTrips(limit = 5, 
    fields = 'id,name,initialdate,finaldate,orden') {
    const fallbackFields = 'id,name,initialdate,finaldate';
    const primary = await this.tripsClient
      .from('trips')
      .select(fields)
      .order('createddate', { ascending: false })
      .limit(limit);

    if (!primary.error) {
      return primary.data;
    }

    if (String(primary.error.message || '').includes('orden')) {
      const fallback = await this.tripsClient
        .from('trips')
        .select(fallbackFields)
        .order('createddate', { ascending: false })
        .limit(limit);

      if (fallback.error) throw exceptions.internal(fallback.error.message);
      return fallback.data;
    }

    throw exceptions.internal(primary.error.message);
  }

  async searchItineraryByTripIDs(tripIds, 
    fields = 'tripid,initialdate,finaldate,placeid,orden') {
    const fallbackFields = 'tripid,initialdate,finaldate,placeid';
    const primary = await this.tripsClient
      .from('trips_itinerary')
      .select(fields)
      .in('tripid', tripIds)
      .order('orden', { ascending: true });

    if (!primary.error) {
      return primary.data;
    }

    if (String(primary.error.message || '').includes('orden')) {
      const fallback = await this.tripsClient
        .from('trips_itinerary')
        .select(fallbackFields)
        .in('tripid', tripIds);

      if (fallback.error) throw exceptions.internal(fallback.error.message);
      return fallback.data;
    }

    throw exceptions.internal(primary.error.message);
  }
  async getVotesSummaryByTripId(tripId) {
    const { data, error } = await 
    this.votesClient
      .from('trips')
      .select('value')
      .eq('tripid', tripId)
      .eq('value', true);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }
  async getUserVoteByTripIdAndUserId(tripId, userId) {
    const {data, error} = await 
    this.votesClient
      .from('trips')
      .select('value')
      .eq('tripid', tripId)
      .eq('userid', userId)
      .eq('value', true);

    if (error) throw exceptions.internal(error.message);
    return data || [];
  }
  async createItinerary(tripId, itineraryData) {
    const payload = itineraryData.map((item, index) => ({
      initialdate: item.initialdate,
      finaldate: item.finaldate,
      placeid: item.placeid,
      tripid: tripId,
      orden: item.orden ?? index + 1
    }));
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .insert(
        payload
      )
      .select();
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getLastItineraryOrden(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .select('orden')
      .eq('tripid', tripId)
      .order('orden', { ascending: false })
      .limit(1);

    if (error) throw exceptions.internal(error.message);
    return data?.[0]?.orden ?? null;
  }

  async addItineraryPlace(tripId, itineraryItem) {
    const payload = {
      initialdate: itineraryItem.initialdate,
      finaldate: itineraryItem.finaldate,
      placeid: itineraryItem.placeid,
      tripid: tripId,
      orden: itineraryItem.orden
    };

    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .insert(payload)
      .select();

    if (error) throw exceptions.internal(error.message);
    return data;
  }
  
  async deleteItineraryItem(id) {
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .delete()
      .eq('id', id);
    if (error) throw exceptions.internal(error.message);
    return data;
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
    if (error) throw exceptions.internal(error.message);
    return data;
  }
  async deleteMemberItem(id) {
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .delete()
      .eq('id', id);
    if (error) throw exceptions.internal(error.message);
    return data;
  }
  async getMembersListByTripIds(tripIds) {
    const { data, error } = await this.tripsClient
      .from('trips_members')
      .select('id,tripid,userid,hide')
      .in('tripid', tripIds);
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async uploadFileToStorage(path, buffer, contentType) {
    const { error } = await this.tripsClient.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw exceptions.internal(error.message);
    return this.getPublicUrl(path);
  }

  getPublicUrl(path) {
    const { data } = this.tripsClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async removeFromStorage(paths) {
    const { data, error } = await this.tripsClient.storage
      .from(STORAGE_BUCKET)
      .remove(paths);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async saveImageUrlsToTrip(tripid, imageUrls) {
    // If there's a cover image in the new batch, reset all existing images first
    const coverImage = imageUrls.find(item => item.iscover);
    if (coverImage) {
      const { error: resetError } = await this.tripsClient
        .from('trips_gallery')
        .update({ iscover: false })
        .eq('tripid', tripid);
      
      if (resetError) {
        console.error('Failed to reset existing cover images:', resetError);
        // Continue anyway - don't fail the whole operation
      }
    }
    
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .insert(
        imageUrls.map((item, index) => ({
          tripid: tripid,
          filename: item.fileName,
          completeurl: item.url,
          iscover: item.iscover || false,
          orden: item.orden ?? index + 1,
          descripcion: item.descripcion || '',
          placeid: item.placeid || null,
          captureddate: item.captureddate || null
        }))
      )
      .select();
    if (error) throw exceptions.internal(error.message);
    
    // If there's a cover image, update the trip's cover_url
    if (coverImage) {
      const { error: updateError } = await this.tripsClient
        .from('trips')
        .update({ cover_url: coverImage.url })
        .eq('id', tripid);
      
      if (updateError) {
        console.error('Failed to update trip cover_url:', updateError);
        // Don't fail the whole operation if cover update fails
      }
    }
    
    return data;
  }
  async getGalleryImagesByTripIds(tripIds) {
    if (!tripIds || tripIds.length === 0) return [];

    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .select('id,tripid,completeurl,iscover')
      .in('tripid', tripIds)
      .order('iscover', { ascending: false })
      .order('id', { ascending: true });

    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async getTripImages(tripId) {
    const selectVariants = [
      'id,filename,completeurl,iscover,orden,placeid,descripcion,captureddate',
      'id,filename,completeurl,iscover,placeid,descripcion,captureddate',
      'id,filename,completeurl,iscover,orden',
      'id,filename,completeurl,iscover'
    ];

    let data = null;
    let lastError = null;

    for (const fields of selectVariants) {
      const result = await this.tripsClient
        .from('trips_gallery')
        .select(fields)
        .eq('tripid', tripId);

      if (!result.error) {
        data = result.data;
        lastError = null;
        break;
      }

      lastError = result.error;
    }

    if (lastError) throw exceptions.internal(lastError.message);
    return data || [];
  }
  
  async getGalleryImageById(imageId) {
    const primary = await this.tripsClient
      .from('trips_gallery')
      .select('filename, tripid, iscover, orden')
      .eq('id', imageId)
      .maybeSingle();

    if (!primary.error) return primary.data;

    if (String(primary.error.message || '').includes('orden')) {
      const fallback = await this.tripsClient
        .from('trips_gallery')
        .select('filename, tripid, iscover')
        .eq('id', imageId)
        .maybeSingle();

      if (fallback.error) throw exceptions.internal(fallback.error.message);
      return fallback.data;
    }

    throw exceptions.internal(primary.error.message);
  }

  async deleteImageFromGallery(imageId) {
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .delete()
      .eq('id', imageId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getFirstGalleryImageByTripId(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .select('id, completeurl')
      .eq('tripid', tripId)
      .limit(1);

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async setGalleryImageCover(imageId, iscover) {
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .update({ iscover })
      .eq('id', imageId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async resetGalleryCoversByTripId(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .update({ iscover: false })
      .eq('tripid', tripId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async updateTripCoverUrl(tripId, coverUrl) {
    const { data, error } = await this.tripsClient
      .from('trips')
      .update({ cover_url: coverUrl })
      .eq('id', tripId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getGalleryImageForTrip(tripId, imageId) {
    const primary = await this.tripsClient
      .from('trips_gallery')
      .select('completeurl, orden')
      .eq('id', imageId)
      .eq('tripid', tripId)
      .maybeSingle();

    if (!primary.error) return primary.data;

    if (String(primary.error.message || '').includes('orden')) {
      const fallback = await this.tripsClient
        .from('trips_gallery')
        .select('completeurl')
        .eq('id', imageId)
        .eq('tripid', tripId)
        .maybeSingle();

      if (fallback.error) throw exceptions.internal(fallback.error.message);
      return fallback.data;
    }

    throw exceptions.internal(primary.error.message);
  }

  async updateGalleryImageMetadata(tripId, imageId, metadata) {
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .update({
        orden: metadata.orden,
        placeid: metadata.placeid ?? null,
        captureddate: metadata.captureddate || null,
        descripcion: metadata.descripcion || ''
      })
      .eq('tripid', tripId)
      .eq('id', imageId)
      .select('id,filename,completeurl,iscover,orden,placeid,descripcion,captureddate');

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }
  
  async getItineraryVotesSummaryByTripId(tripId) {
    const { data, error } = await this.votesClient
      .from('trips_itineraries')
      .select('placeid, tripid, value')
      .eq('tripid', tripId)
      .eq('value', true);

    if (error) throw exceptions.internal(error.message);
    return data || [];
  }
  
  async getUserItineraryVotesByTripIdAndUserId(tripId, userId) {
    const { data, error } = await this.votesClient
      .from('trips_itineraries')
      .select('placeid, tripid, value')
      .eq('tripid', tripId)
      .eq('userid', userId)
      .eq('value', true);

    if (error) throw exceptions.internal(error.message);
    return data || [];
  }
  
  async getItineraryVotesByMembersByTripId(tripId, memberUserIds) {
    if (!memberUserIds || memberUserIds.length === 0) return [];

    const { data, error } = await this.votesClient
      .from('trips_itineraries')
      .select('placeid, tripid, userid, value')
      .eq('tripid', tripId)
      .eq('value', true)
      .in('userid', memberUserIds);

    if (error) throw exceptions.internal(error.message);
    return data || [];
  }
  async getCommentById(commentId) {
    const { data, error } = await this.tripsClient
      .from('trips_comments')
      .select('*')
      .eq('id', commentId)
      .maybeSingle();

    if (error) throw exceptions.internal(error.message);
    return data;
  }
  async getCommentsByTripId(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_comments')
      .select('*')
      .eq('trip_id', tripId);

    if (error) throw exceptions.internal(error.message);
    return data || [];
  }
  async saveComment(tripId, commentData) {
    const { data, error } = await this.tripsClient
      .from('trips_comments')
      .insert([{ trip_id: tripId, ...commentData }])
      .select('*');

    if (error) throw exceptions.internal(error.message);
    return data;
  }
  async updateComment(commentId, commentData) {
    const updatedDate = new Date();
    const { data, error } = await this.tripsClient
      .from('trips_comments')
      .update({ ...commentData, updateddate: updatedDate })
      .eq('id', commentId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }
  async deleteComment(commentId) {
    const { data, error } = await this.tripsClient
      .from('trips_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }
  
}

export default TripsRepository;