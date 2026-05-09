import sharp from 'sharp';

// Encapsulates all Supabase access for places.
class PlacesRepository {
  constructor({ placesClient, catalogClient, votesClient }) {
    this.placesClient = placesClient;
    this.catalogClient = catalogClient;
    this.votesClient = votesClient;
  }

  async createPlace(payload) {
    const { data, error } = await this.placesClient
      .from('places')
      .insert(payload)
      .select()
      .single();
    if (error) return { status: 500, error };
    return { status: 201, data };
  }

  async updatePlace(id, payload) {
    const { data, error } = await this.placesClient
      .from('places')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async deletePlace(id) {
    const { data, error } = await this.placesClient
      .from('places')
      .delete()
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async getPlaceByIdRaw(id, fields = 'name, countryid, stateid, cityid, description, ispublic, address, latitude, longitude') {
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .eq('id', id);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    if (!Array.isArray(ids) || ids.length === 0) return { status: 200, data: [] };
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .in('id', ids);
    if (error) return { status: 500, error };
    return { status: 200, data };
  }

  async searchPlaces(filters = {}, 
    fields = 'id,name,countryid,stateid,cityid,address',
    page = 1,
    limit = 10) {
    let query = 
    this.placesClient.from('places').
    select(fields)
    .range((page - 1) * limit, page * limit - 1)
    .order('createddate', { ascending: false });
    
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.countryid) {
      query = query.eq('countryid', filters.countryid);
    }
    if (filters.stateid) {
      query = query.eq('stateid', filters.stateid);
    }
    if (filters.cityid) {
      query = query.eq('cityid', filters.cityid);
    }
    const { data, error } = await query;
    if (error) return { status: 500, error };
    if (!data || data.length === 0) return { status: 404, message: "No results to show" };
    return { status: 200, data : data };
  }
  async getFacilitiesByPlaceId(placeId) {
    const { data, error } = await this.placesClient
      .from('places_facilities')
      .select('facilityid, value')
      .eq('placeid', placeId)
      .eq('value', true);
    if (error) return { status: 500, error };
    
    if (!data || data.length === 0) {
      return { status: 200, data: [] };
    }
    const facilityIds = data.map(item => item.facilityid);
    
    const {data: facilitiesData, error: facilitiesError } = await this.catalogClient
      .from('facilities')
      .select('name, code')
      .in('id', facilityIds);

    if (facilitiesError) return { status: 500, error: facilitiesError };

    return { status: 200, data: facilitiesData };
  }
  async getVotesByPlaceIdSummary(placeId) {
    
    const { data, error } = 
    await this.votesClient
      .from('places')
      .select('value')
      .eq('placeid', placeId)
      .eq('value', true);
    if (error) return { status: 500, error: error.message };
    const total = data ? data.length : 0;
    return { status: 200, data: [{ total : total }] };
  }
  async getUserVoteByPlaceIdAndUserId(placeId, userId) {
    const {data, error} = await 
    this.votesClient
      .from('places')
      .select('id,value')
      .eq('placeid', placeId)
      .eq('userid', userId)
      .eq('value', true);
    
    if (error) return { status: 500, error };
    if (!data || data.length === 0) {
      return { status: 200, data: { value: false } };
    }
    return { status: 200, data: { value: true } };
  }
  async searchPlacesByField(field, name, 
    fields = 'id,name,countryid,stateid,cityid') {
    let query = 
    this.placesClient.from('places').select(fields).limit(5);
    if (field && name) {
      query = query.ilike(field, `%${name}%`);
    }

    const { data, error } = await query;
    if (error) return { status: 500, error };
    return { status: 200, data };
  }
  async uploadImagesToStorage(placeId, images) {
    try {
      const uploadedUrls = [];
      const bucketName = 'adondevamosNoGallery';
      const folder = 'places';
      const thumbnailFolder = 'places/thumbnails';

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const timestamp = Date.now();
        const fileName = `${folder}/${placeId}_${timestamp}_${i}.${image.extension || 'jpg'}`;
        const thumbnailFileName = `${thumbnailFolder}/${placeId}_${timestamp}_${i}.${image.extension || 'jpg'}`;

        // Upload original image to Supabase storage
        const { data, error } = await this.placesClient.storage
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
        const { error: thumbnailError } = await this.placesClient.storage
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
        const { data: urlData } = this.placesClient.storage
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
  async updateFacilities(placeId, facilitiesData) {
    // First, delete existing facilities for the place
    const { error: deleteError } = await this.placesClient
      .from('places_facilities')
      .delete()
      .eq('placeid', placeId);
    if (deleteError) return { status: 500, error: deleteError };
    if (!facilitiesData || facilitiesData.length === 0) {
      return { status: 200, data: [] };
    }
    // Now, insert the new facilities
    const payload = facilitiesData.map(facility => ({
      placeid: placeId,
      facilityid: facility.facilityid,
      value: facility.value
    }));
    const { data, error: insertError } = await this.placesClient
      .from('places_facilities')
      .insert(payload)
      .select();
    if (insertError) return { status: 500, error: insertError };
    return { status: 200, data };
  }
  async addFacilities(placeId, facilitiesData) {
    // Insert new facilities without deleting existing ones
    const payload = facilitiesData.map(facility => ({
      placeid: placeId,
      facilityid: facility.facilityid,
      value: facility.value
    }));
    const { data, error: insertError } = await this.placesClient
      .from('places_facilities')
      .insert(payload)
      .select();
    if (insertError) return { status: 500, error: insertError };
    return { status: 200, data };
  }
  async saveImageUrlsToPlace(placeId, imageUrls) {
    const { data, error } = await this.placesClient
      .from('places_gallery')
      .insert(
        imageUrls.map(item => ({
          placeid: placeId,
          filename: item.fileName,
          completeurl: item.url,
          iscover: item.iscover || false
        }))
      )
      .select();
    if (error) return { status: 500, error: error.message };
    
    // If there's a cover image, update the place's cover_url
    const coverImage = imageUrls.find(item => item.iscover);
    if (coverImage) {
      const { error: updateError } = await this.placesClient
        .from('places')
        .update({ cover_url: coverImage.url })
        .eq('id', placeId);
      
      if (updateError) {
        console.error('Failed to update place cover_url:', updateError);
        // Don't fail the whole operation if cover update fails
      }
    }
    
    return { status: 200, data: data };
  }
  async getGalleryByPlaceId(placeId) {
    const { data, error } = await this.placesClient
      .from('places_gallery')
      .select('id, filename, completeurl')
      .eq('placeid', placeId);
    if (error) return { status: 500, error: error.message };
    
    // Add thumbnail URLs for each image
    const bucketName = 'adondevamosNoGallery';
    const galleryWithThumbnails = data.map(item => {
      // Construct thumbnail path: places/file.jpg -> places/thumbnails/file.jpg
      const thumbnailFilename = item.filename.replace('places/', 'places/thumbnails/');
      const { data: thumbnailUrlData } = this.placesClient.storage
        .from(bucketName)
        .getPublicUrl(thumbnailFilename);
      
      return {
        ...item,
        thumbnailurl: thumbnailUrlData.publicUrl
      };
    });
    
    return { status: 200, data: galleryWithThumbnails };
  }
  async getNewPlaces(limit = 5, fields = 'id,name,countryid,stateid,cityid,address') {
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .order('createddate', { ascending: false })
      .limit(limit);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data };
  }
  
  async deleteImageFromGallery(imageId) {
    // First get the image details to retrieve the filename
    const { data: imageData, error: fetchError } = await this.placesClient
      .from('places_gallery')
      .select('filename, placeid')
      .eq('id', imageId)
      .single();
    
    if (fetchError) return { status: 500, error: fetchError.message };
    if (!imageData) return { status: 404, error: 'Image not found' };
    
    // Delete from storage bucket
    const bucketName = 'adondevamosNoGallery';
    const { error: storageError } = await this.placesClient.storage
      .from(bucketName)
      .remove([imageData.filename]);
    
    if (storageError) return { status: 500, error: storageError.message };
    
    // Delete thumbnail (construct thumbnail path from original filename)
    // places/placeId_timestamp_i.jpg -> places/thumbnails/placeId_timestamp_i.jpg
    const thumbnailFilename = imageData.filename.replace('places/', 'places/thumbnails/');
    const { error: thumbnailError } = await this.placesClient.storage
      .from(bucketName)
      .remove([thumbnailFilename]);
    
    if (thumbnailError) {
      // Log error but don't fail the whole deletion
      console.error(`Failed to delete thumbnail ${thumbnailFilename}:`, thumbnailError.message);
    }
    
    // Delete from database
    const { error: deleteError } = await this.placesClient
      .from('places_gallery')
      .delete()
      .eq('id', imageId);
    
    if (deleteError) return { status: 500, error: deleteError.message };
    
    return { status: 200, data: { message: 'Image deleted successfully', imageId, filename: imageData.filename } };
  }

  async setCoverImage(placeId, imageId) {
    // First, get the image URL
    const { data: imageData, error: fetchError } = await this.placesClient
      .from('places_gallery')
      .select('completeurl')
      .eq('id', imageId)
      .eq('placeid', placeId)
      .single();
    
    if (fetchError) return { status: 500, error: fetchError.message };
    if (!imageData) return { status: 404, error: 'Image not found' };
    
    // Update all images for this place to set iscover = false
    const { error: resetError } = await this.placesClient
      .from('places_gallery')
      .update({ iscover: false })
      .eq('placeid', placeId);
    
    if (resetError) return { status: 500, error: resetError.message };
    
    // Set the selected image as cover
    const { error: setCoverError } = await this.placesClient
      .from('places_gallery')
      .update({ iscover: true })
      .eq('id', imageId);
    
    if (setCoverError) return { status: 500, error: setCoverError.message };
    
    // Update the place's cover_url
    const { error: updatePlaceError } = await this.placesClient
      .from('places')
      .update({ cover_url: imageData.completeurl })
      .eq('id', placeId);
    
    if (updatePlaceError) return { status: 500, error: updatePlaceError.message };
    
    return { status: 200, data: { message: 'Cover image updated successfully', coverUrl: imageData.completeurl } };
  }
      

}

export default PlacesRepository;