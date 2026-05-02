import sharp from 'sharp';

// Repository isolates all Supabase (DB) calls for trips domain.
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

  async getTripByIdRaw(id, fields = 'id,name,cover_url,ownerid,description,initialdate,finaldate,isinternational') {
    const { data, error } = await this.tripsClient
      .from('trips')
      .select(fields)
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

  async getUsersByIds(
    ids, 
    fields = 'id,name,lastname,email,tag',
    userId = null
  ) {
    const { data, error } = await this.usersClient
      .from('users')
      .select(fields)
      .in('id', ids);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchTrips(filters = {}, 
    fields = 'id,name,ownerid,initialdate,finaldate', 
    userId = null,
    page = 1,
    limit = 10) {
    
    // Get total count first with same filters
    let countQuery = this.tripsClient.from('trips').select('id', { count: 'exact', head: false });
    let query = this.tripsClient.from('trips').select(fields);
    
    // Handle location filters from places through itinerary table
    const hasLocationFilter = filters.countryid || filters.stateid || filters.cityid;
    if (hasLocationFilter) {
      // First, find places matching the location criteria from places schema
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
      if (placesError) return { status: 500, error: placesError };
      
      if (!placesData || placesData.length === 0) {
        return { status: 404, message: "No results to show" };
      }
      
      const placeIds = placesData.map(place => place.id);
      
      // Then find itineraries containing those places
      const { data: itineraryData, error: itineraryError } = await this.tripsClient
        .from('trips_itinerary')
        .select('tripid')
        .in('placeid', placeIds);
      
      if (itineraryError) return { status: 500, error: itineraryError };
      
      if (!itineraryData || itineraryData.length === 0) {
        return { status: 404, message: "No results to show" };
      }
      
      // Extract unique trip IDs from itinerary results
      const tripIds = [...new Set(itineraryData.map(item => item.tripid))];
      
      // Filter trips by the found trip IDs
      query = query.in('id', tripIds);
      countQuery = countQuery.in('id', tripIds);
    }
    
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
      countQuery = countQuery.ilike('name', `%${filters.name}%`);
    }

    if (filters.initialdate) {
      query = query.gte('initialdate', filters.initialdate);
      countQuery = countQuery.gte('initialdate', filters.initialdate);
    }

    if (filters.finaldate) {
      query = query.lte('finaldate', filters.finaldate);
      countQuery = countQuery.lte('finaldate', filters.finaldate);
    }

    if (filters.mytrips){
      query = query.eq('ownerid', userId);
      countQuery = countQuery.eq('ownerid', userId);
    }

    if (filters.membertrips){
      query = query.in('id', this.tripsClient.from('trips_members').select('tripid').eq('userid', userId));
      countQuery = countQuery.in('id', this.tripsClient.from('trips_members').select('tripid').eq('userid', userId));
    }
    
    // Get total count
    const { count, error: countError } = await countQuery;
    if (countError) return { status: 500, error: countError };
    
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    query = query.order('createddate', { ascending: false });
    
    const { data, error } = await query;
    if (error) return { status: 500, error };
    if (!data || data.length === 0) return { status: 404, message: "No results to show" };
    
    return { 
      status: 200, 
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  async getNewsTrips(limit = 5, 
    fields = 'id,name,initialdate,finaldate') {
    const { data, error } = await this.tripsClient
      .from('trips')
      .select(fields)
      .order('createddate', { ascending: false })
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
      placeid: item.placeid,
      tripid: tripId
    }));
    const { data, error } = await this.tripsClient
      .from('trips_itinerary')
      .insert(
        payload
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

  async uploadImagesToStorage(tripId, images) {
    try {
      const uploadedUrls = [];
      const bucketName = 'adondevamosNoGallery';
      const folder = 'trips';
      const thumbnailFolder = 'trips/thumbnails';

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const timestamp = Date.now();
        const fileName = `${folder}/${tripId}_${timestamp}_${i}.${image.extension || 'jpg'}`;
        const thumbnailFileName = `${thumbnailFolder}/${tripId}_${timestamp}_${i}.${image.extension || 'jpg'}`;

        // Upload original image to Supabase storage
        const { data, error } = await this.tripsClient.storage
          .from(bucketName)
          .upload(fileName, image.buffer, {
            contentType: image.mimetype || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          return { status: 500, error: error.message };
        }

        // Generate 128x128px thumbnail
        const thumbnailBuffer = await sharp(image.buffer)
          .resize(128, 128, {
            fit: 'cover',
            position: 'center'
          })
          .toBuffer();

        // Upload thumbnail to Supabase storage
        const { error: thumbnailError } = await this.tripsClient.storage
          .from(bucketName)
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: image.mimetype || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (thumbnailError) {
          // Log error but don't fail the whole upload
          console.error(`Failed to upload thumbnail for ${fileName}:`, thumbnailError.message);
        }

        // Get public URL
        const { data: urlData } = this.tripsClient.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        uploadedUrls.push({
          fileName: fileName,
          url: urlData.publicUrl,
          iscover: image.iscover || false
        });
      }

      return { status: 200, data: uploadedUrls };
    } catch (error) {
      return { status: 500, error: error.message };
    }
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
        imageUrls.map(item => ({
          tripid: tripid,
          filename: item.fileName,
          completeurl: item.url,
          iscover: item.iscover || false
        }))
      )
      .select();
    if (error) return { status: 500, error: error.message };
    
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
    
    return { status: 200, data: data };
  }
  async getTripImages(tripId) {
    const { data, error } = await this.tripsClient
      .from('trips_gallery')
      .select('id,filename,completeurl,iscover')
      .eq('tripid', tripId);
    if (error) return { status: 500, error: error.message };
    
    // Add thumbnail URLs for each image
    const bucketName = 'adondevamosNoGallery';
    const galleryWithThumbnails = data.map(item => {
      // Construct thumbnail path: trips/file.jpg -> trips/thumbnails/file.jpg
      const thumbnailFilename = item.filename.replace('trips/', 'trips/thumbnails/');
      const { data: thumbnailUrlData } = this.tripsClient.storage
        .from(bucketName)
        .getPublicUrl(thumbnailFilename);
      
      return {
        ...item,
        thumbnailurl: thumbnailUrlData.publicUrl
      };
    });
    
    return { status: 200, data: galleryWithThumbnails };
  }
  
  async deleteImageFromGallery(imageId) {
    // First get the image details to retrieve the filename and cover status
    const { data: imageData, error: fetchError } = await this.tripsClient
      .from('trips_gallery')
      .select('filename, tripid, iscover')
      .eq('id', imageId)
      .single();
    
    if (fetchError) return { status: 500, error: fetchError.message };
    if (!imageData) return { status: 404, error: 'Image not found' };
    
    const { tripid, iscover } = imageData;
    
    // Delete from storage bucket
    const bucketName = 'adondevamosNoGallery';
    const { error: storageError } = await this.tripsClient.storage
      .from(bucketName)
      .remove([imageData.filename]);
    
    if (storageError) return { status: 500, error: storageError.message };
    
    // Delete thumbnail (construct thumbnail path from original filename)
    // trips/tripId_timestamp_i.jpg -> trips/thumbnails/tripId_timestamp_i.jpg
    const thumbnailFilename = imageData.filename.replace('trips/', 'trips/thumbnails/');
    const { error: thumbnailError } = await this.tripsClient.storage
      .from(bucketName)
      .remove([thumbnailFilename]);
    
    if (thumbnailError) {
      // Log error but don't fail the whole deletion
      console.error(`Failed to delete thumbnail ${thumbnailFilename}:`, thumbnailError.message);
    }
    
    // Delete from database
    const { error: deleteError } = await this.tripsClient
      .from('trips_gallery')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) return { status: 500, error: deleteError.message };
    
    // If the deleted image was the cover, clear the trip's cover_url
    if (iscover) {
      // Check if there are remaining images for this trip
      const { data: remainingImages, error: remainingError } = await this.tripsClient
        .from('trips_gallery')
        .select('id, completeurl')
        .eq('tripid', tripid)
        .limit(1);
      
      if (!remainingError && remainingImages && remainingImages.length > 0) {
        // Set the first remaining image as the new cover
        const newCoverImage = remainingImages[0];
        
        await this.tripsClient
          .from('trips_gallery')
          .update({ iscover: true })
          .eq('id', newCoverImage.id);
        
        await this.tripsClient
          .from('trips')
          .update({ cover_url: newCoverImage.completeurl })
          .eq('id', tripid);
      } else {
        // No remaining images, clear the cover_url
        await this.tripsClient
          .from('trips')
          .update({ cover_url: null })
          .eq('id', tripid);
      }
    }
    
    return { status: 200, data: { message: 'Image deleted successfully', imageId, filename: imageData.filename } };
  }

  async setCoverImage(tripId, imageId) {
    // First, get the image URL
    const { data: imageData, error: fetchError } = await this.tripsClient
      .from('trips_gallery')
      .select('completeurl')
      .eq('id', imageId)
      .eq('tripid', tripId)
      .single();
    
    if (fetchError) return { status: 500, error: fetchError.message };
    if (!imageData) return { status: 404, error: 'Image not found' };
    
    // Update all images for this trip to set iscover = false
    const { error: resetError } = await this.tripsClient
      .from('trips_gallery')
      .update({ iscover: false })
      .eq('tripid', tripId);
    
    if (resetError) return { status: 500, error: resetError.message };
    
    // Set the selected image as cover
    const { error: setCoverError } = await this.tripsClient
      .from('trips_gallery')
      .update({ iscover: true })
      .eq('id', imageId);
    
    if (setCoverError) return { status: 500, error: setCoverError.message };
    
    // Update the trip's cover_url
    const { error: updateTripError } = await this.tripsClient
      .from('trips')
      .update({ cover_url: imageData.completeurl })
      .eq('id', tripId);
    
    if (updateTripError) return { status: 500, error: updateTripError.message };
    
    return { status: 200, data: { message: 'Cover image updated successfully', coverUrl: imageData.completeurl } };
  }
  
  async getItineraryVotesSummaryByTripId(tripId) {
    const { data, error } = await this.votesClient
      .from('trips_itineraries')
      .select('placeid, tripid, value')
      .eq('tripid', tripId)
      .eq('value', true);
      
    if (error) return { status: 500, error };
    
    // Group votes by placeid and count them
    const voteCounts = {};
    data.forEach(vote => {
      if (!voteCounts[vote.placeid]) {
        voteCounts[vote.placeid] = 0;
      }
      voteCounts[vote.placeid]++;
    });
    
    return { status: 200, data: voteCounts };
  }
  
  async getUserItineraryVotesByTripIdAndUserId(tripId, userId) {
    const { data, error } = await this.votesClient
      .from('trips_itineraries')
      .select('placeid, tripid, value')
      .eq('tripid', tripId)
      .eq('userid', userId)
      .eq('value', true);
      
    if (error) return { status: 500, error };
    
    // Convert to a set of placeid that user has voted for
    const userVotes = new Set(data.map(vote => vote.placeid));
    
    return { status: 200, data: userVotes };
  }
  
  async getItineraryVotesByMembersByTripId(tripId, memberUserIds) {
    if (!memberUserIds || memberUserIds.length === 0) {
      return { status: 200, data: {} };
    }
    
    const { data, error } = await this.votesClient
      .from('trips_itineraries')
      .select('placeid, tripid, userid, value')
      .eq('tripid', tripId)
      .eq('value', true)
      .in('userid', memberUserIds);
      
    if (error) return { status: 500, error };
    
    // Group votes by placeid and count only member votes
    const memberVoteCounts = {};
    data.forEach(vote => {
      if (!memberVoteCounts[vote.placeid]) {
        memberVoteCounts[vote.placeid] = 0;
      }
      memberVoteCounts[vote.placeid]++;
    });
    
    return { status: 200, data: memberVoteCounts };
  }
}

export default TripsRepository;