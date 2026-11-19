import sharp from 'sharp';
import TripsRepository from '../repositories/trips.repository.js';
import placesService from './places.service.js';
import ubicationService from './ubication.service.js';
import { clientTrips, userClient, votesClient, clientPlaces } from '../config/supabase.js';
import { mapPlacesWithUbicationNames } from '../mappers/ubication.mapper.js';
import { sendAddedToTripEmail, sendRemovedFromTripEmail } from '../config/email.config.js';
import exceptions from '../middleware/exceptions.middleware.js';

const tripsRepo = new TripsRepository(
  { 
    tripsClient: clientTrips, 
    usersClient: userClient,
    votesClient: votesClient,
    placesClient: clientPlaces
  }
);

const tripsService = {
  async createTrip(createTripRq) {
    return await tripsRepo.createTrip(createTripRq);
  },

  async updateTrip(tripId, updateTripRq) {
    return await tripsRepo.updateTrip(tripId, updateTripRq);
  },

  

  async deleteTrip(tripId) {
    return await tripsRepo.deleteTrip(tripId);
  },

  async uploadImages(tripId, images) {
    // Verify trip exists
    const tripExists = await tripsRepo.getTripByIdRaw(tripId);
    if (!tripExists) {
      throw exceptions.notFound('Trip not found');
    }

    const uploadedUrls = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const timestamp = Date.now();
      const extension = image.extension || 'jpg';
      const contentType = image.mimetype || 'image/jpeg';
      const fileName = `trips/${tripId}_${timestamp}_${i}.${extension}`;
      const thumbnailFileName = `trips/thumbnails/${tripId}_${timestamp}_${i}.${extension}`;

      const url = await tripsRepo.uploadFileToStorage(fileName, image.buffer, contentType);

      //a failed thumbnail is logged but does not fail the upload
      try {
        const thumbnailBuffer = await sharp(image.buffer)
          .resize(128, 128, { fit: 'cover', position: 'center' })
          .toBuffer();
        await tripsRepo.uploadFileToStorage(thumbnailFileName, thumbnailBuffer, contentType);
      } catch (error) {
        console.error(`Failed to upload thumbnail for ${fileName}:`, error.message);
      }

      uploadedUrls.push({
        fileName,
        url,
        iscover: image.iscover || false,
        orden: image.orden,
        placeid: image.placeid || null,
        captureddate: image.captureddate || null,
        descripcion: image.descripcion || ''
      });
    }

    return await tripsRepo.saveImageUrlsToTrip(tripId, uploadedUrls);
  },

  async getTripById(tripId, 
    userid = null, 
    fields = null) {
    // base trip
    const tripRow = await tripsRepo.getTripByIdRaw(tripId);
    if (!tripRow) throw exceptions.notFound('Trip not found');
    
    // Determine which fields to fetch based on request
    const needsOwner = !fields || fields.includes('owner');
    const needsItinerary = !fields || fields.includes('itinerary');
    const needsMembers = !fields || fields.includes('members');
    const needsStatics = !fields || fields.includes('statics');
    const needsUserVoted = !fields || fields.includes('userVoted');
    const needsVotes = needsStatics || needsUserVoted;
    const needsGallery = !fields || fields.includes('gallery');

    // owner
    let owner = null;
    if (needsOwner) {
      owner = await tripsRepo.getOwnerById(tripRow.ownerid);
      if (!owner) throw exceptions.notFound('Owner not found');
    }

    // itinerary raw
    let itinerary = [];
    if (needsItinerary) {
      itinerary = await tripsRepo.getItineraryByTripId(tripId) || [];

      // place IDs
      const placeIds = itinerary.map(i => i.placeid);
      let placesList = [];
      if (placeIds.length > 0) {
        placesList = await placesService.searchPlacesByIDs(placeIds, 'id,name,countryid,stateid,cityid,latitude,longitude');
      }

      // ubication names
      const ubicationNames = await ubicationService.getUbicationNamesByIDs(placesList);

      // map itinerary with ubication names
      const itineraryWithUbicationNames = mapPlacesWithUbicationNames(placesList, ubicationNames);
      
      //combine itinerary data with place and ubication info
      itinerary = itinerary.map(item => {
        const placeInfo = itineraryWithUbicationNames.find(p => p.id === item.placeid);
        itineraryWithUbicationNames.forEach(place => {
          delete place.countryid;
          delete place.stateid;
          delete place.cityid;
        });
        return {
          initialdate: item.initialdate,
          finaldate: item.finaldate,
          orden: item.orden,
          place: placeInfo
        };
      });
      
      // get votes summary for itinerary items (all votes)
      const itineraryVotesSummary = await tripsRepo.getItineraryVotesSummaryByTripId(tripId);
      
      // get member votes summary for itinerary items
      // first get member list to get all member user IDs
      const membersList = await tripsRepo.getMembersListByTripId(tripId);
      let itineraryMemberVotes = {};
      const memberUserIds = [...new Set([
        ...(membersList || []).map(m => m.userid),
        tripRow.ownerid
      ].filter(Boolean))];

      if (memberUserIds.length > 0) {
        itineraryMemberVotes = await tripsRepo.getItineraryVotesByMembersByTripId(tripId, memberUserIds);
      }
      
      // get user votes for itinerary items if user is provided
      let userItineraryVotes = new Set();
      if (userid) {
        userItineraryVotes = await tripsRepo.getUserItineraryVotesByTripIdAndUserId(tripId, userid);
      }
      
      // add voting information to each itinerary item
      itinerary = itinerary.map(item => {
        const generalVotes = itineraryVotesSummary[item.place.id] || 0;
        const memberVotes = itineraryMemberVotes[item.place.id] || 0;
        return {
          ...item,
          votes: {
            general: generalVotes,
            members: memberVotes,
            total_votes: generalVotes + memberVotes
          },
          userVoted: userItineraryVotes.has(item.place.id)
        };
      });
    }
    
    // members
    let membersList = [];
    let membersEnriched = [];
    if (needsMembers) {
      membersList = await tripsRepo.getMembersListByTripId(tripId) || [];

      // member user details
      const memberUserIds = membersList.map(m => m.userid);
      let usersInfo = [];
      if (memberUserIds.length > 0) {
        usersInfo = await tripsRepo.getUsersByIds(memberUserIds) || [];
      }

      // attach user info to members
      const userMap = new Map(usersInfo.map(u => [u.id, u]));
      membersEnriched = membersList.map(m => ({
        id: m.id,
        hide: m.hide,
        userid: m.userid,
        user: userMap.get(m.userid) || null
      }));
    }
    
    //get votes summary
    let votesSummary = [{ total: 0 }];
    let userVote = { value: false };
    if (needsVotes) {
      if (needsStatics) {
        votesSummary = await tripsRepo.getVotesSummaryByTripId(tripId);
      }
      
      //validate if the user has voted
      if (needsUserVoted && userid) {
        const userVoteRows = await tripsRepo.getUserVoteByTripIdAndUserId(tripId, userid);
        userVote = { value: userVoteRows.length > 0 };
      }
    }

    //get gallery images
    let galleryImages = [];
    if (needsGallery) {
      galleryImages = await tripsRepo.getTripImages(tripId) || [];
    }
    
    // Build return data with only requested fields
    const returnData = {
      id: tripRow.id,
      name: tripRow.name,
      description: tripRow.description,
      initialdate: tripRow.initialdate,
      finaldate: tripRow.finaldate,
      isinternational: tripRow.isinternational,
      orden: tripRow.orden,
      cover_url: tripRow.cover_url
    };

    // Add optional fields only if requested
    if (needsItinerary) {
      returnData.itinerary = itinerary;
    }
    if (needsOwner) {
      returnData.owner = owner;
    }
    if (needsMembers) {
      returnData.members = membersEnriched;
    }
    if (needsStatics) {
      returnData.statics = {
        Votes: {
          Total: votesSummary[0].total
        }
      };
    }
    if (needsUserVoted) {
      returnData.userVoted = userVote.value || false;
    }
    if (needsGallery) {
      returnData.gallery = galleryImages;
    }

    return returnData;
  },

  async getItineraryByTripId(tripId) {
    return await tripsRepo.getItineraryByTripId(tripId);
  },

  async getMembersListByTripId(tripId) {
    return await tripsRepo.getMembersListByTripId(tripId);
  },

  async getAll(filters = {}, userId = null, page = 1, limit = 10) {
    return await tripsRepo.searchTrips(filters, 'id,name,ownerid,initialdate,finaldate,orden', userId, page, limit);
  },

  async getTripsByOwner(ownerId, page = 1, limit = 50, options = {}) {
    const { action = null, placeIds = [] } = options;

    const trips = await tripsRepo.searchTrips(
      { ownerid: ownerId },
      'id,name,initialdate,finaldate',
      null,
      page,
      limit
    );

    if (action !== 'additinerary') {
      return trips;
    }

    const normalizedPlaceIds = [...new Set(
      (Array.isArray(placeIds) ? placeIds : [placeIds])
        .flatMap(value => String(value).split(','))
        .map(value => Number(value))
        .filter(value => Number.isFinite(value) && value > 0)
    )];

    if (normalizedPlaceIds.length === 0) {
      throw exceptions.badRequest('placeid/placeids is required when action=additinerary');
    }

    const tripIds = (trips.data || []).map(trip => trip.id);
    if (tripIds.length === 0) {
      return {
        ...trips,
        data: []
      };
    }

    const itineraryRows = await tripsRepo.searchItineraryByTripIDs(tripIds, 'tripid,placeid') || [];

    const tripPlaceMap = new Map();
    for (const item of itineraryRows) {
      const tripId = Number(item.tripid);
      if (!tripPlaceMap.has(tripId)) {
        tripPlaceMap.set(tripId, new Set());
      }
      tripPlaceMap.get(tripId).add(Number(item.placeid));
    }

    return {
      ...trips,
      data: (trips.data || []).map(trip => {
        const tripPlaces = tripPlaceMap.get(Number(trip.id)) || new Set();
        const hasPlaceInItinerary = normalizedPlaceIds.some(placeId => tripPlaces.has(placeId));

        return {
          id: trip.id,
          name: trip.name,
          initialdate: trip.initialdate,
          finaldate: trip.finaldate,
          hasPlaceInItinerary
        };
      })
    };
  },

  async searchTrips(filters = {}, 
    userId = null,
    page = 1,
    limit = 10) {

    //get trip list
    const foundedTrips = await tripsRepo.searchTrips(filters, 
      'id,name,description,initialdate,finaldate,isinternational,ownerid', userId, page, limit);

    if (!Array.isArray(foundedTrips.data) || foundedTrips.data.length === 0) {
      return {
        data: [],
        pagination: foundedTrips.pagination
      };
    }

    //get owners info
    const ownerIds = [...new Set(foundedTrips.data.map(trip => trip.ownerid).filter(Boolean))];

    let ownersInfo = [];
    if (ownerIds.length > 0) {
      ownersInfo = await tripsRepo.getUsersByIds(ownerIds, 'id,name,lastname,email,tag') || [];
    }

    const ownerMap = new Map(ownersInfo.map(o => [o.id, o]));

    //get one gallery image per trip (cover first)
    const galleryImages = await tripsRepo.getGalleryImagesByTripIds(foundedTrips.data.map(trip => trip.id));
    const coverByTripId = new Map();
    for (const image of galleryImages) {
      if (!coverByTripId.has(image.tripid)) coverByTripId.set(image.tripid, image);
    }

    //attach owner info and cover image to trips
    const tripsWithOwners = foundedTrips.data.map(trip => {
      const image = coverByTripId.get(trip.id);
      return {
        ...trip,
        owner: ownerMap.get(trip.ownerid) || null,
        gallery: image ? [{ id: image.id, completeurl: image.completeurl, iscover: image.iscover }] : []
      };
    });
    
    return { 
      data: tripsWithOwners,
      pagination: foundedTrips.pagination
    };
  },

  async getNewsTrips(limit = 5, userId = null, fields = null) {
    const newsTrips = await tripsRepo.getNewsTrips(limit, 'id');

    //get info of trips
    const resultsToReturn = await Promise.all(
      newsTrips.map(trip => this.getTripById(trip.id, userId, fields))
    );

    return resultsToReturn;
  },

  async searchItineraryByTripIDs(tripIds, fields = 'tripid,initialdate,finaldate,placeid') {
    return await tripsRepo.searchItineraryByTripIDs(tripIds, fields);
  },
  async createItinerary(tripId, itineraryData) {
    const existingItems = await tripsRepo.getItineraryByTripId(tripId) || [];
    const existingKeys = new Set(
      existingItems.map(item => `${item.placeid}|${item.initialdate}|${item.finaldate}`)
    );

    const itemsToAdd = [];
    for (const item of itineraryData || []) {
      const key = `${item.placeid}|${item.initialdate}|${item.finaldate}`;
      if (existingKeys.has(key)) {
        continue;
      }

      existingKeys.add(key);
      itemsToAdd.push(item);
    }

    if (itemsToAdd.length === 0) {
      return existingItems;
    }

    if (existingItems.length === 0) {
      return await tripsRepo.createItinerary(tripId, itemsToAdd);
    }

    const insertedItems = [];
    for (const item of itemsToAdd) {
      const result = await tripsRepo.addItineraryPlace(tripId, item);
      insertedItems.push(...(result || []));
    }

    return [...existingItems, ...insertedItems];
  },
  async addItineraryPlace(tripId, itineraryItem) {
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (!trip) {
      throw exceptions.notFound('Trip not found');
    }

    // Repeated places are allowed by design in trip itineraries.
    return await tripsRepo.addItineraryPlace(tripId, itineraryItem);
  },
  async updateItinerary(tripId, itineraryData) {
    //get existing itinerary
    const existingItinerary = await tripsRepo.getItineraryByTripId(tripId) || [];
    
    //delete existing itinerary entries
    for (const item of existingItinerary) {
      await tripsRepo.deleteItineraryItem(item.id);
    }
    if (itineraryData.length === 0) {
      return [];
    }
    return await tripsRepo.createItinerary(tripId, itineraryData);
  },
  async createMemberList(tripId, membersData) {
    // Create the member list
    const result = await tripsRepo.createMemberList(tripId, membersData);
    
    // Send emails to newly added members
    if (membersData && membersData.length > 0) {
      // Get trip and owner information
      const trip = await tripsRepo.getTripByIdRaw(tripId);
      if (trip) {
        const tripInfo = trip;
        
        // Get owner information
        const owner = await tripsRepo.getOwnerById(tripInfo.ownerid);
        if (owner) {
          const ownerInfo = owner;
          
          // Get member user IDs
          const memberUserIds = membersData.map(m => m.userid);
          
          // Get user details
          const users = await tripsRepo.getUsersByIds(memberUserIds, 'id,name,lastname,email');
          if (users) {
            for (const user of users) {
              if (user.email) {
                try {
                  await sendAddedToTripEmail(
                    user.email,
                    user.name,
                    tripInfo.name,
                    ownerInfo.name,
                    ownerInfo.tag
                  );
                } catch (error) {
                  console.error(`Failed to send added email to ${user.email}:`, error);
                  // Continue even if email fails
                }
              }
            }
          }
        }
      }
    }
    
    return result;
  },
  async updateMemberList(tripId, membersData) {
    //get existing members list
    const existingMembers = await tripsRepo.getMembersListByTripIds([tripId]) || [];
    
    // Extract user IDs for comparison
    const oldMemberIds = new Set(existingMembers.map(m => m.userid));
    const newMemberIds = new Set((membersData || []).map(m => m.userid));
    
    // Find added and removed members
    const addedMemberIds = [...newMemberIds].filter(id => !oldMemberIds.has(id));
    const removedMemberIds = [...oldMemberIds].filter(id => !newMemberIds.has(id));
    
    // Get trip and owner information for email notifications
    let tripInfo = null;
    let ownerInfo = null;
    
    if (addedMemberIds.length > 0 || removedMemberIds.length > 0) {
      // Get trip information
      const trip = await tripsRepo.getTripByIdRaw(tripId);
      if (trip) {
        tripInfo = trip;
        
        // Get owner information
        const owner = await tripsRepo.getOwnerById(tripInfo.ownerid);
        if (owner) {
          ownerInfo = owner;
        }
      }
    }
    
    // Send emails to added members
    if (addedMemberIds.length > 0 && tripInfo && ownerInfo) {
      const addedUsers = await tripsRepo.getUsersByIds(addedMemberIds, 'id,name,lastname,email');
      if (addedUsers) {
        for (const user of addedUsers) {
          if (user.email) {
            try {
              await sendAddedToTripEmail(
                user.email,
                user.name,
                tripInfo.name,
                ownerInfo.name,
                ownerInfo.tag
              );
            } catch (error) {
              console.error(`Failed to send added email to ${user.email}:`, error);
              // Continue even if email fails
            }
          }
        }
      }
    }
    
    //delete existing members entries
    for (const item of existingMembers) {
      await tripsRepo.deleteMemberItem(item.id);
    }
    
    // Send emails to removed members
    if (removedMemberIds.length > 0 && tripInfo && ownerInfo) {
      const removedUsers = await tripsRepo.getUsersByIds(removedMemberIds, 'id,name,lastname,email');
      if (removedUsers) {
        for (const user of removedUsers) {
          if (user.email) {
            try {
              await sendRemovedFromTripEmail(
                user.email,
                user.name,
                tripInfo.name,
                ownerInfo.name,
                ownerInfo.tag
              );
            } catch (error) {
              console.error(`Failed to send removed email to ${user.email}:`, error);
              // Continue even if email fails
            }
          }
        }
      }
    }
    
    if (membersData.length === 0) {
      return [];
    }
    return await tripsRepo.createMemberList(tripId, membersData);
  },
  
  async deleteImage(tripId, imageId) {
    // Verify trip exists
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (!trip) {
      throw exceptions.notFound('Trip not found');
    }
    
    return await tripsRepo.deleteImageFromGallery(imageId);
  },

  async setCoverImage(tripId, imageId) {
    // Verify trip exists
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (!trip) {
      throw exceptions.notFound('Trip not found');
    }

    const image = await tripsRepo.getGalleryImageForTrip(tripId, imageId);
    if (!image) throw exceptions.notFound('Image not found');

    await tripsRepo.resetGalleryCoversByTripId(tripId);
    await tripsRepo.setGalleryImageCover(imageId, true);
    await tripsRepo.updateTripCoverUrl(tripId, image.completeurl);

    return { message: 'Cover image updated successfully', coverUrl: image.completeurl };
  },

  async updateImagesMetadata(tripId, imagesMetadata) {
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (!trip) {
      throw exceptions.notFound('Trip not found');
    }

    const updatedImages = [];
    for (const image of imagesMetadata) {
      const imageId = Number(image.id);
      if (!Number.isFinite(imageId) || imageId <= 0) {
        throw exceptions.badRequest('Each image must have a valid id');
      }

      const row = await tripsRepo.updateGalleryImageMetadata(tripId, imageId, image);
      if (!row) throw exceptions.notFound(`Image ${imageId} not found for this trip`);
      updatedImages.push(row);
    }

    return updatedImages;
  },
  async saveComment(tripId, commentData) {
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (!trip) {
      throw exceptions.notFound('Trip not found');
    }

    if (commentData.answerd_to){
      const parentComment = await tripsRepo.getCommentById(commentData.answerd_to);
      if (!parentComment) {
        throw exceptions.notFound('Previus comment not found');
      }
    }

    return await tripsRepo.saveComment(tripId, commentData);
  },
  async updateComment(commentId, commentData) {
    const comment = await tripsRepo.getCommentById(commentId);
    if (!comment) {
      throw exceptions.notFound('Comment not found');
    }
    return await tripsRepo.updateComment(commentId, commentData);
  },
  async deleteComment(commentId) {
    const comment = await tripsRepo.getCommentById(commentId);
    if (!comment) {
      throw exceptions.notFound('Comment not found');
    }
    return await tripsRepo.deleteComment(commentId);
  },
  async getCommentsByTripId(tripId) {
    return await tripsRepo.getCommentsByTripId(tripId);
  },

};

export default tripsService;