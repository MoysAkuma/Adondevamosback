import sharp from 'sharp';
import PlacesRepository from '../repositories/places.repository.js';
import { mapPlacesWithUbicationNames } from '../mappers/ubication.mapper.js';
import exceptions from '../middleware/exceptions.middleware.js';
import ubicationService from './ubication.service.js';
import { clientPlaces, cataloguesClient, votesClient } from '../config/supabase.js'; // adjust to your actual supabase client export

const placesRepo = new PlacesRepository(
  { 
    placesClient: clientPlaces, 
    catalogClient: cataloguesClient,
    votesClient: votesClient 
  });

const ensurePlaceExists = async (placeId) => {
  const places = await placesRepo.getPlaceByIdRaw(placeId, 'id');
  if (places.length === 0) throw exceptions.notFound("Place not found");
};

const placesService = {
  // Helper method to enrich place data with full details; returns null when the place does not exist
  async _enrichPlaceWithFullDetails(placeId, userid = null) {
    const places = await placesRepo.getPlaceByIdRaw(placeId);
    if (places.length === 0) return null;

    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(places);
    const placeWithUbicationNames = mapPlacesWithUbicationNames(places, ubicationNames);

    //get facilities
    const facilities = await placesRepo.getFacilitiesByPlaceId(placeId);

    //unset countryid, stateid, cityid from placeWithUbicationNames
    placeWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });

    placeWithUbicationNames[0].facilities = facilities;

    //get votes
    const votesTotal = await placesRepo.getVotesByPlaceIdSummary(placeId);
    placeWithUbicationNames[0].statics = {
      Votes: {
        Total: votesTotal
      }
    };

    //validate if user has voted place
    let userVote = false;
    if (userid) {
      const userVotes = await placesRepo.getUserVoteByPlaceIdAndUserId(placeId, userid);
      userVote = userVotes.length > 0;
    }
    placeWithUbicationNames[0].userVote = userVote;

    //get gallery
    placeWithUbicationNames[0].gallery = await placesRepo.getGalleryByPlaceId(placeId);

    return { ...placeWithUbicationNames[0], id: placeId };
  },

  async createPlace(rq) {
    return await placesRepo.createPlace(rq);
  },

  async updatePlace(id, rq) {
    return await placesRepo.updatePlace(id, rq);
  },

  async deletePlace(id) {
    return await placesRepo.deletePlace(id);
  },

  async getPlaceById(id, userid = null) {
    const place = await this._enrichPlaceWithFullDetails(id, userid);
    if (!place) throw exceptions.notFound("Place not found");
    return place;
  },

  async searchPlacesByIDs(ids, fields = 'id,name,countryid,stateid,cityid') {
    return await placesRepo.searchPlacesByIDs(ids, fields);
  },

  async searchPlaces(filters = {}, fields = 'id,name,countryid,stateid,cityid,address,description,latitude,longitude', page = 1, limit = 10) {
    const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;

    const totalCount = await placesRepo.countPlaces(filters);
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / safeLimit);
    const pagination = {
      page: safePage,
      limit: safeLimit,
      totalCount,
      totalPages,
      hasNextPage: totalPages > 0 && safePage < totalPages,
      hasPreviousPage: safePage > 1
    };

    if (totalCount === 0) return { data: [], pagination };

    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;
    const places = await placesRepo.searchPlaces(filters, fields, from, to);
    if (places.length === 0) return { data: [], pagination };
    
    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(places);
    const placesWithUbicationNames = mapPlacesWithUbicationNames(places, ubicationNames);

    //unset countryid, stateid, cityid from placesWithUbicationNames
    placesWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });
    //get one gallery image per place (cover first)
    const galleryImages = await placesRepo.getGalleryImagesByPlaceIds(placesWithUbicationNames.map(place => place.id));
    const coverByPlaceId = new Map();
    for (const image of galleryImages) {
      if (!coverByPlaceId.has(image.placeid)) coverByPlaceId.set(image.placeid, image);
    }
    placesWithUbicationNames.forEach(place => {
      const image = coverByPlaceId.get(place.id);
      place.gallery = image ? [{ id: image.id, completeurl: image.completeurl, iscover: image.iscover }] : [];
    });

    return { data: placesWithUbicationNames, pagination };
  },
  async searchPlacesByField(field, name, 
    fields = 'id,name,countryid,stateid,cityid') {
    
    const places = await placesRepo.searchPlacesByField(field, name, fields);
    if (places.length === 0) throw exceptions.notFound("No results to show");
    //get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(places);
    const placesWithUbicationNames = mapPlacesWithUbicationNames(places, ubicationNames);
    //unset countryid, stateid, cityid from placesWithUbicationNames
    placesWithUbicationNames.forEach(place => {
      delete place.countryid;
      delete place.stateid;
      delete place.cityid;
    });
    return placesWithUbicationNames;
  },
  async uploadImages(placeId, images) {
    //verify place exists
    await ensurePlaceExists(placeId);

    const uploadedUrls = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const timestamp = Date.now();
      const extension = image.extension || 'jpg';
      const contentType = image.mimetype || 'image/jpeg';
      const fileName = `places/${placeId}_${timestamp}_${i}.${extension}`;
      const thumbnailFileName = `places/thumbnails/${placeId}_${timestamp}_${i}.${extension}`;

      await placesRepo.uploadGalleryFile(fileName, image.buffer, contentType);

      //a failed thumbnail is logged but does not fail the upload
      try {
        const thumbnailBuffer = await sharp(image.buffer)
          .resize(128, 128, { fit: 'cover', position: 'center' })
          .toBuffer();
        await placesRepo.uploadGalleryFile(thumbnailFileName, thumbnailBuffer, contentType);
      } catch (error) {
        console.error(`Failed to upload thumbnail for ${fileName}:`, error.message);
      }

      uploadedUrls.push({
        fileName,
        url: placesRepo.getGalleryPublicUrl(fileName),
        iscover: image.iscover || false
      });
    }

    //save image urls in place record
    return await placesRepo.saveImageUrlsToPlace(placeId, uploadedUrls);
  },
  async updateFacilities(placeId, facilitiesData) {
    //verify place exists
    await ensurePlaceExists(placeId);
    return await placesRepo.updateFacilities(placeId, facilitiesData);
  },
  async addFacilities(placeId, facilitiesData) {
    //verify place exists
    await ensurePlaceExists(placeId);
    const createdFacilities = await placesRepo.addFacilities(placeId, facilitiesData);
    return createdFacilities.map(facility => ({ id: facility.id }));
  }, 
  async getNewPlaces(limit = 10, userid = null) {
    const places = await placesRepo.getNewPlaces(limit);
    if (places.length === 0) return [];
    
    // Enrich each place with full details
    const enrichedPlaces = await Promise.all(
      places.map(place => this._enrichPlaceWithFullDetails(place.id, userid))
    );
    
    // Drop places that disappeared between listing and enrichment
    return enrichedPlaces.filter(Boolean);
  },
  
  async deleteImage(placeId, imageId) {
    await ensurePlaceExists(placeId);

    const image = await placesRepo.getGalleryImage(imageId, null, 'id, filename, placeid, completeurl');
    if (!image) throw exceptions.notFound("Image not found");

    await placesRepo.removeGalleryFiles([image.filename]);

    //a failed thumbnail removal is logged but does not fail the deletion
    const thumbnailFilename = image.filename.replace('places/', 'places/thumbnails/');
    try {
      await placesRepo.removeGalleryFiles([thumbnailFilename]);
    } catch (error) {
      console.error(`Failed to delete thumbnail ${thumbnailFilename}:`, error.message);
    }

    await placesRepo.deleteGalleryImage(imageId);

    return { message: 'Image deleted successfully', imageId, filename: image.filename };
  },

  async setCoverImage(placeId, imageId) {
    await ensurePlaceExists(placeId);

    const image = await placesRepo.getGalleryImage(imageId, placeId, 'completeurl');
    if (!image) throw exceptions.notFound("Image not found");

    await placesRepo.resetGalleryCovers(placeId);
    await placesRepo.setGalleryImageCover(imageId);
    await placesRepo.updatePlaceCoverUrl(placeId, image.completeurl);

    return { message: 'Cover image updated successfully', coverUrl: image.completeurl };
  },

  async updateImagesMetadata(placeId, imagesMetadata) {
    await ensurePlaceExists(placeId);

    const updatedImages = [];
    for (const image of imagesMetadata) {
      const row = await placesRepo.updateGalleryImageMetadata(placeId, image);
      if (!row) throw exceptions.notFound(`Image ${image.id} not found for this place`);

      updatedImages.push({
        id: row.id,
        filename: row.filename,
        completeurl: row.completeurl,
        iscover: row.iscover,
        orden: row.orden,
        placeid: row.placeid,
        descripcion: row.description,
        captureddate: row.capturedate
      });
    }

    return updatedImages;
  }
};

export default placesService;