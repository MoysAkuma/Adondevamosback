import exceptions from '../middleware/exceptions.middleware.js';

const GALLERY_BUCKET = 'adondevamosNoGallery';

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
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async updatePlace(id, payload) {
    const { data, error } = await this.placesClient
      .from('places')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async deletePlace(id) {
    const { data, error } = await this.placesClient
      .from('places')
      .delete()
      .eq('id', id);
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getPlaceByIdRaw(id, fields = 'name, countryid, stateid, cityid, description, ispublic, address, latitude, longitude') {
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .eq('id', id);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .in('id', ids);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  _applyPlaceFilters(query, filters = {}) {
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
    return query;
  }

  async countPlaces(filters = {}) {
    const { count, error } = await this._applyPlaceFilters(
      this.placesClient.from('places').select('id', { count: 'exact', head: true }),
      filters
    );
    if (error) throw exceptions.internal(error.message);
    return count || 0;
  }

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid,address', from = 0, to = 9) {
    const { data, error } = await this._applyPlaceFilters(
      this.placesClient.from('places').select(fields),
      filters
    )
      .order('createddate', { ascending: false })
      .range(from, to);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async getFacilitiesByPlaceId(placeId) {
    const { data, error } = await this.placesClient
      .from('places_facilities')
      .select('facilityid, value')
      .eq('placeid', placeId)
      .eq('value', true);
    if (error) throw exceptions.internal(error.message);

    if (!data || data.length === 0) return [];
    const facilityIds = data.map(item => item.facilityid);

    const { data: facilitiesData, error: facilitiesError } = await this.catalogClient
      .from('facilities')
      .select('name, code')
      .in('id', facilityIds);
    if (facilitiesError) throw exceptions.internal(facilitiesError.message);

    return facilitiesData || [];
  }

  async getVotesByPlaceIdSummary(placeId) {
    const { count, error } = await this.votesClient
      .from('places')
      .select('id', { count: 'exact', head: true })
      .eq('placeid', placeId)
      .eq('value', true);
    if (error) throw exceptions.internal(error.message);
    return count || 0;
  }

  async getUserVoteByPlaceIdAndUserId(placeId, userId) {
    const { data, error } = await this.votesClient
      .from('places')
      .select('id,value')
      .eq('placeid', placeId)
      .eq('userid', userId)
      .eq('value', true);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async searchPlacesByField(field, name,
    fields = 'id,name,countryid,stateid,cityid') {
    let query = this.placesClient.from('places').select(fields).limit(5);
    if (field && name) {
      query = query.ilike(field, `%${name}%`);
    }

    const { data, error } = await query;
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async uploadGalleryFile(path, buffer, contentType) {
    const { error } = await this.placesClient.storage
      .from(GALLERY_BUCKET)
      .upload(path, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });
    if (error) throw exceptions.internal(error.message);
  }

  async removeGalleryFiles(paths) {
    const { error } = await this.placesClient.storage
      .from(GALLERY_BUCKET)
      .remove(paths);
    if (error) throw exceptions.internal(error.message);
  }

  getGalleryPublicUrl(path) {
    const { data } = this.placesClient.storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async updateFacilities(placeId, facilitiesData) {
    const { error: deleteError } = await this.placesClient
      .from('places_facilities')
      .delete()
      .eq('placeid', placeId);
    if (deleteError) throw exceptions.internal(deleteError.message);
    if (!facilitiesData || facilitiesData.length === 0) return [];

    const payload = facilitiesData.map(facility => ({
      placeid: placeId,
      facilityid: facility.facilityid,
      value: facility.value
    }));
    const { data, error: insertError } = await this.placesClient
      .from('places_facilities')
      .insert(payload)
      .select();
    if (insertError) throw exceptions.internal(insertError.message);
    return data || [];
  }

  async addFacilities(placeId, facilitiesData) {
    const payload = facilitiesData.map(facility => ({
      placeid: placeId,
      facilityid: facility.facilityid,
      value: facility.value
    }));
    const { data, error: insertError } = await this.placesClient
      .from('places_facilities')
      .insert(payload)
      .select();
    if (insertError) throw exceptions.internal(insertError.message);
    return data || [];
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
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async updatePlaceCoverUrl(placeId, coverUrl) {
    const { error } = await this.placesClient
      .from('places')
      .update({ cover_url: coverUrl })
      .eq('id', placeId);
    if (error) throw exceptions.internal(error.message);
  }

  async getGalleryImagesByPlaceIds(placeIds) {
    if (!placeIds || placeIds.length === 0) return [];

    const { data, error } = await this.placesClient
      .from('places_gallery')
      .select('id,placeid,completeurl,iscover')
      .in('placeid', placeIds)
      .order('iscover', { ascending: false })
      .order('id', { ascending: true });
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async getGalleryByPlaceId(placeId) {
    const { data, error } = await this.placesClient
      .from('places_gallery')
      .select('id, filename, completeurl, orden, placeid, iscover, description, capturedate')
      .eq('placeid', placeId);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async getNewPlaces(limit = 5, fields = 'id,name,countryid,stateid,cityid,address') {
    const { data, error } = await this.placesClient
      .from('places')
      .select(fields)
      .order('createddate', { ascending: false })
      .limit(limit);
    if (error) throw exceptions.internal(error.message);
    return data || [];
  }

  async getGalleryImage(imageId, placeId = null, fields = 'id, filename, placeid, completeurl') {
    let query = this.placesClient
      .from('places_gallery')
      .select(fields)
      .eq('id', imageId);
    if (placeId !== null) {
      query = query.eq('placeid', placeId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async deleteGalleryImage(imageId) {
    const { error } = await this.placesClient
      .from('places_gallery')
      .delete()
      .eq('id', imageId);
    if (error) throw exceptions.internal(error.message);
  }

  async resetGalleryCovers(placeId) {
    const { error } = await this.placesClient
      .from('places_gallery')
      .update({ iscover: false })
      .eq('placeid', placeId);
    if (error) throw exceptions.internal(error.message);
  }

  async setGalleryImageCover(imageId) {
    const { error } = await this.placesClient
      .from('places_gallery')
      .update({ iscover: true })
      .eq('id', imageId);
    if (error) throw exceptions.internal(error.message);
  }

  async updateGalleryImageMetadata(placeId, image) {
    const { data, error } = await this.placesClient
      .from('places_gallery')
      .update({
        orden: image.orden,
        capturedate: image.captureddate || null,
        description: image.descripcion || ''
      })
      .eq('placeid', placeId)
      .eq('id', image.id)
      .select('id,filename,completeurl,iscover,orden,placeid,description,capturedate');
    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }
}

export default PlacesRepository;
