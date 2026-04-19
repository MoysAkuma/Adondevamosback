import TripsRepository from '../repositories/trips.repository.js';
import placesService from './places.service.js';
import ubicationService from './ubication.service.js';
import { clientTrips, userClient, votesClient, clientPlaces } from '../config/supabase.js';
import { mapPlacesWithUbicationNames } from '../mappers/ubication.mapper.js';
import { sendAddedToTripEmail, sendRemovedFromTripEmail } from '../config/email.config.js';

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
    if (tripExists.status !== 200 || !tripExists.data || tripExists.data.length === 0) {
      return { status: 404, error: 'Trip not found' };
    }

    const saveUploadedFiles =
     await tripsRepo.uploadImagesToStorage(tripId, images);
    if (saveUploadedFiles.status !== 200) {
      return saveUploadedFiles;
    }
    const saveImageUrls =
     await tripsRepo.saveImageUrlsToTrip(tripId, saveUploadedFiles.data);
    return saveImageUrls;
  },

  async getTripById(tripId, userid = null, fields = null) {
    // base trip
    const base = await tripsRepo.getTripByIdRaw(tripId);
    if (base.status !== 200) return base;
    if (!base.data || base.data.length === 0) return { status: 404, data: null };

    const tripRow = base.data[0];
    
    // Determine which fields to fetch based on request
    const needsOwner = !fields || fields.includes('owner');
    const needsItinerary = !fields || fields.includes('itinerary');
    const needsMembers = !fields || fields.includes('members');
    const needsStatics = !fields || fields.includes('statics');
    const needsUserVoted = !fields || fields.includes('userVoted');
    const needsVotes = needsStatics || needsUserVoted;
    const needsGallery = !fields || fields.includes('gallery');

    // owner
    let owner = { status: 200, data: [] };
    if (needsOwner) {
      owner = await tripsRepo.getOwnerById(tripRow.ownerid);
      if (owner.status !== 200) return owner;
      if (!owner.data || owner.data.length === 0) return { status: 404, data: null };
    }

    // itinerary raw
    let itinerary = { status: 200, data: [] };
    if (needsItinerary) {
      itinerary = await tripsRepo.getItineraryByTripId(tripId);
      if (itinerary.status !== 200) return itinerary;

      // place IDs
      const placeIds = (itinerary.data || []).map(i => i.placeid);
      let placesList = { status: 200, data: [] };
      if (placeIds.length > 0) {
        placesList = await placesService.searchPlacesByIDs(placeIds, 'id,name,countryid,stateid,cityid,latitude,longitude');
        if (placesList.status !== 200) return placesList;
      }

      // ubication names
      const ubicationNames = await ubicationService.getUbicationNamesByIDs(placesList.data);
      if (ubicationNames.status !== 200) return ubicationNames;

      // map itinerary with ubication names
      const itineraryWithUbicationNames = mapPlacesWithUbicationNames(placesList.data, ubicationNames.data);
      
      //combine itinerary data with place and ubication info
      itinerary.data = (itinerary.data || []).map(item => {
        const placeInfo = itineraryWithUbicationNames.find(p => p.id === item.placeid);
        itineraryWithUbicationNames.forEach(place => {
          delete place.countryid;
          delete place.stateid;
          delete place.cityid;
        });
        return {
          initialdate: item.initialdate,
          finaldate: item.finaldate,
          place: placeInfo
        };
      });
      
      // get votes summary for itinerary items (all votes)
      const itineraryVotesSummary = await tripsRepo.getItineraryVotesSummaryByTripId(tripId);
      if (itineraryVotesSummary.status !== 200) return itineraryVotesSummary;
      
      // get member votes summary for itinerary items
      // first get member list to get all member user IDs
      const membersList = await tripsRepo.getMembersListByTripId(tripId);
      let itineraryMemberVotes = { status: 200, data: {} };
      if (membersList.status === 200 && membersList.data && membersList.data.length > 0) {
        const memberUserIds = membersList.data.map(m => m.userid);
        itineraryMemberVotes = await tripsRepo.getItineraryVotesByMembersByTripId(tripId, memberUserIds);
        if (itineraryMemberVotes.status !== 200) return itineraryMemberVotes;
      }
      
      // get user votes for itinerary items if user is provided
      let userItineraryVotes = new Set();
      if (userid) {
        const userVotesResult = await tripsRepo.getUserItineraryVotesByTripIdAndUserId(tripId, userid);
        if (userVotesResult.status !== 200) return userVotesResult;
        userItineraryVotes = userVotesResult.data;
      }
      
      // add voting information to each itinerary item
      itinerary.data = itinerary.data.map(item => {
        const generalVotes = itineraryVotesSummary.data[item.place.id] || 0;
        const memberVotes = itineraryMemberVotes.data[item.place.id] || 0;
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
    let membersList = { status: 200, data: [] };
    let membersEnriched = [];
    if (needsMembers) {
      membersList = await tripsRepo.getMembersListByTripId(tripId);
      if (membersList.status !== 200) return membersList;

      // member user details
      const memberUserIds = (membersList.data || []).map(m => m.userid);
      let usersInfo = { status: 200, data: [] };
      if (memberUserIds.length > 0) {
        usersInfo = await tripsRepo.getUsersByIds(memberUserIds);
        if (usersInfo.status !== 200) return usersInfo;
      }

      // attach user info to members
      const userMap = new Map(usersInfo.data.map(u => [u.id, u]));
      membersEnriched = (membersList.data || []).map(m => ({
        id: m.id,
        hide: m.hide,
        userid: m.userid,
        user: userMap.get(m.userid) || null
      }));
    }
    
    //get votes summary
    let votesSummary = { status: 200, data: [{ total: 0 }] };
    let userVote = { status: 200, data: { value: false } };
    if (needsVotes) {
      if (needsStatics) {
        votesSummary = await tripsRepo.getVotesSummaryByTripId(tripId);
        if (votesSummary.status !== 200) return votesSummary;
      }
      
      //validate if the user has voted
      if (needsUserVoted && userid) {
        userVote = await tripsRepo.getUserVoteByTripIdAndUserId(tripId, userid);
        if (userVote.status !== 200) return userVote;
      }
    }

    //get gallery images
    let galleryImages = { status: 200, data: [] };
    if (needsGallery) {
      galleryImages = await tripsRepo.getTripImages(tripId);
      if (galleryImages.status !== 200) return galleryImages;
    }
    
    // Build return data with only requested fields
    const returnData = {
      id: tripRow.id,
      name: tripRow.name,
      description: tripRow.description,
      initialdate: tripRow.initialdate,
      finaldate: tripRow.finaldate,
      isinternational: tripRow.isinternational
    };

    // Add optional fields only if requested
    if (needsItinerary) {
      returnData.itinerary = itinerary.data;
    }
    if (needsOwner) {
      returnData.owner = owner.data[0];
    }
    if (needsMembers) {
      returnData.members = membersEnriched;
    }
    if (needsStatics) {
      returnData.statics = {
        Votes: {
          Total: votesSummary.data[0].total
        }
      };
    }
    if (needsUserVoted) {
      returnData.userVoted = userVote.data.value || false;
    }
    if (needsGallery) {
      returnData.gallery = galleryImages.data;
    }

    return { status: 200, data: returnData };
  },

  async getItineraryByTripId(tripId) {
    return await tripsRepo.getItineraryByTripId(tripId);
  },

  async getMembersListByTripId(tripId) {
    return await tripsRepo.getMembersListByTripId(tripId);
  },

  async getAll(filters = {}, userId = null) {
    return await tripsRepo.searchTrips(filters, 'id,name,ownerid,initialdate,finaldate', userId);
  },

  async searchTrips(filters, 
    userId = null) {

    //get trip list
    const foundedTrips = await tripsRepo.searchTrips(filters, 
      'id,name,description,initialdate,finaldate,isinternational,ownerid', userId);

    if( foundedTrips.status != 200 ) {
      return foundedTrips;
    }
    //get owners info
    const ownerIds = [...new Set(foundedTrips.data.map(trip => trip.ownerid))];
    const ownersInfo = await tripsRepo.getUsersByIds(ownerIds, 'id,name,lastname,email,tag');
    if(ownersInfo.status != 200){
      return ApiError("owners info error", ownersInfo.status )
    }
    const ownerMap = new Map(ownersInfo.data.map(o => [o.id, o]));
    //attach owner info to trips
    foundedTrips.data = foundedTrips.data.map(trip => ({
      ...trip,
      owner: ownerMap.get(trip.ownerid) || null
    }));
    
    return { status: 200, data: foundedTrips.data };
  },

  async getNewsTrips(limit = 5, userId = null, fields = null) {
    const result = await tripsRepo.getNewsTrips(limit, 'id');
    
    if (result.status !== 200) {
      return result;
    }
    
    //get info of trips
    let resultsToReturn = await Promise.all(
      result.data.map(trip => this.getTripById(trip.id, userId, fields))
    );

    return { status: 200, data: resultsToReturn.map(r => r.data) }; 
  },

  async searchItineraryByTripIDs(tripIds, fields = 'tripid,initialdate,finaldate,placeid') {
    return await tripsRepo.searchItineraryByTripIDs(tripIds, fields);
  },
  async createItinerary(tripId, itineraryData) {
    return await tripsRepo.createItinerary(tripId, itineraryData);
  },
  async updateItinerary(tripId, itineraryData) {
    //get existing itinerary
    const existingItinerary = await tripsRepo.getItineraryByTripId(tripId);
    
    if (existingItinerary.status !== 200) return existingItinerary;
    
    //delete existing itinerary entries
    for (const item of existingItinerary.data) {
      await tripsRepo.deleteItineraryItem(item.id);
    }
    if (itineraryData.length === 0) {
      return { status: 201, data: [] };
    }
    return await tripsRepo.createItinerary(tripId, itineraryData);
  },
  async createMemberList(tripId, membersData) {
    // Create the member list
    const result = await tripsRepo.createMemberList(tripId, membersData);
    
    // Send emails to newly added members
    if (result.status === 201 && membersData && membersData.length > 0) {
      // Get trip and owner information
      const trip = await tripsRepo.getTripByIdRaw(tripId);
      if (trip.status === 200 && trip.data && trip.data.length > 0) {
        const tripInfo = trip.data[0];
        
        // Get owner information
        const owner = await tripsRepo.getOwnerById(tripInfo.ownerid);
        if (owner.status === 200 && owner.data && owner.data.length > 0) {
          const ownerInfo = owner.data[0];
          
          // Get member user IDs
          const memberUserIds = membersData.map(m => m.userid);
          
          // Get user details
          const users = await tripsRepo.getUsersByIds(memberUserIds, 'id,name,lastname,email');
          if (users.status === 200 && users.data) {
            for (const user of users.data) {
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
    const existingMembers = 
    await tripsRepo.getMembersListByTripIds([tripId]);
    if (existingMembers.status !== 200) return existingMembers;
    
    // Extract user IDs for comparison
    const oldMemberIds = new Set((existingMembers.data || []).map(m => m.userid));
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
      if (trip.status === 200 && trip.data && trip.data.length > 0) {
        tripInfo = trip.data[0];
        
        // Get owner information
        const owner = await tripsRepo.getOwnerById(tripInfo.ownerid);
        if (owner.status === 200 && owner.data && owner.data.length > 0) {
          ownerInfo = owner.data[0];
        }
      }
    }
    
    // Send emails to added members
    if (addedMemberIds.length > 0 && tripInfo && ownerInfo) {
      const addedUsers = await tripsRepo.getUsersByIds(addedMemberIds, 'id,name,lastname,email');
      if (addedUsers.status === 200 && addedUsers.data) {
        for (const user of addedUsers.data) {
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
    for (const item of existingMembers.data) {
      await tripsRepo.deleteMemberItem(item.id);
    }
    
    // Send emails to removed members
    if (removedMemberIds.length > 0 && tripInfo && ownerInfo) {
      const removedUsers = await tripsRepo.getUsersByIds(removedMemberIds, 'id,name,lastname,email');
      if (removedUsers.status === 200 && removedUsers.data) {
        for (const user of removedUsers.data) {
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
      return { status: 201, data: [] };
    }
    return await tripsRepo.createMemberList(tripId, membersData);
  },
  
  async deleteImage(tripId, imageId) {
    // Verify trip exists
    const trip = await tripsRepo.getTripByIdRaw(tripId);
    if (trip.status !== 200) return trip;
    if (!trip.data || trip.data.length === 0) {
      return { status: 404, error: 'Trip not found' };
    }
    
    return await tripsRepo.deleteImageFromGallery(imageId);
  }
};

export default tripsService;