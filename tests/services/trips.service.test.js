import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const repoMethods = {
  createTrip: jest.fn(),
  updateTrip: jest.fn(),
  deleteTrip: jest.fn(),
  getTripByIdRaw: jest.fn(),
  uploadFileToStorage: jest.fn(),
  saveImageUrlsToTrip: jest.fn(),
  getOwnerById: jest.fn(),
  getItineraryByTripId: jest.fn(),
  getItineraryVotesSummaryByTripId: jest.fn(),
  getMembersListByTripId: jest.fn(),
  getItineraryVotesByMembersByTripId: jest.fn(),
  getUserItineraryVotesByTripIdAndUserId: jest.fn(),
  getUsersByIds: jest.fn(),
  getVotesSummaryByTripId: jest.fn(),
  getUserVoteByTripIdAndUserId: jest.fn(),
  getTripImages: jest.fn(),
  searchTrips: jest.fn(),
  searchItineraryByTripIDs: jest.fn(),
  getNewsTrips: jest.fn(),
  createItinerary: jest.fn(),
  addItineraryPlace: jest.fn(),
  deleteItineraryItem: jest.fn(),
  createMemberList: jest.fn(),
  getMembersListByTripIds: jest.fn(),
  deleteMemberItem: jest.fn(),
  deleteImageFromGallery: jest.fn(),
  getGalleryImageForTrip: jest.fn(),
  resetGalleryCoversByTripId: jest.fn(),
  setGalleryImageCover: jest.fn(),
  updateTripCoverUrl: jest.fn(),
  updateGalleryImageMetadata: jest.fn(),
  getCommentById: jest.fn()
};

const mockTripsRepoConstructor = jest.fn(() => repoMethods);
const mockSearchPlacesByIDs = jest.fn();
const mockGetUbicationNamesByIDs = jest.fn();
const mockMapPlacesWithUbicationNames = jest.fn();
const mockSendAddedToTripEmail = jest.fn();
const mockSendRemovedFromTripEmail = jest.fn();

jest.unstable_mockModule('../../src/repositories/trips.repository.js', () => ({
  default: mockTripsRepoConstructor
}));

jest.unstable_mockModule('../../src/services/places.service.js', () => ({
  default: {
    searchPlacesByIDs: mockSearchPlacesByIDs
  }
}));

jest.unstable_mockModule('../../src/services/ubication.service.js', () => ({
  default: {
    getUbicationNamesByIDs: mockGetUbicationNamesByIDs
  }
}));

jest.unstable_mockModule('../../src/mappers/ubication.mapper.js', () => ({
  mapPlacesWithUbicationNames: mockMapPlacesWithUbicationNames
}));

jest.unstable_mockModule('../../src/config/email.config.js', () => ({
  sendAddedToTripEmail: mockSendAddedToTripEmail,
  sendRemovedFromTripEmail: mockSendRemovedFromTripEmail
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  clientTrips: {},
  userClient: {},
  votesClient: {},
  clientPlaces: {}
}));

const { default: tripsService } = await import('../../src/services/trips.service.js');

describe('trips.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTrip delegates to repository', async () => {
    repoMethods.createTrip.mockResolvedValue({ id: 1 });

    const result = await tripsService.createTrip({ name: 'Trip A' });

    expect(repoMethods.createTrip).toHaveBeenCalledWith({ name: 'Trip A' });
    expect(result).toEqual({ id: 1 });
  });

  test('updateTrip delegates to repository', async () => {
    repoMethods.updateTrip.mockResolvedValue({ id: 2 });

    const result = await tripsService.updateTrip(2, { name: 'Updated' });

    expect(repoMethods.updateTrip).toHaveBeenCalledWith(2, { name: 'Updated' });
    expect(result).toEqual({ id: 2 });
  });

  test('deleteTrip delegates to repository', async () => {
    repoMethods.deleteTrip.mockResolvedValue({});

    const result = await tripsService.deleteTrip(3);

    expect(repoMethods.deleteTrip).toHaveBeenCalledWith(3);
    expect(result).toEqual({});
  });

  test('getTripById throws notFound when trip does not exist', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue(null);

    await expect(tripsService.getTripById(777)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Trip not found'
    });
  });

  test('getTripById returns base + owner when only owner field is requested', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({
      id: 10,
      name: 'Andes',
      description: 'Desc',
      initialdate: '2026-01-01',
      finaldate: '2026-01-05',
      isinternational: true,
      orden: 1,
      cover_url: 'cover.webp',
      ownerid: 55
    });
    repoMethods.getOwnerById.mockResolvedValue({ id: 55, tag: 'owner55', name: 'Moises' });

    const result = await tripsService.getTripById(10, null, ['owner']);

    expect(repoMethods.getOwnerById).toHaveBeenCalledWith(55);
    expect(repoMethods.getItineraryByTripId).not.toHaveBeenCalled();
    expect(repoMethods.getMembersListByTripId).not.toHaveBeenCalled();
    expect(result.owner).toEqual({ id: 55, tag: 'owner55', name: 'Moises' });
    expect(result.gallery).toBeUndefined();
  });

  test('getTripById returns enriched itinerary with votes and userVoted flag', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({
      id: 20,
      name: 'CR Tour',
      description: 'desc',
      initialdate: '2026-02-01',
      finaldate: '2026-02-08',
      isinternational: false,
      orden: 2,
      cover_url: null,
      ownerid: 7
    });

    repoMethods.getItineraryByTripId.mockResolvedValue([
      { placeid: 101, initialdate: '2026-02-02', finaldate: '2026-02-03', orden: 1 }
    ]);

    mockSearchPlacesByIDs.mockResolvedValue([
      { id: 101, name: 'Arenal', countryid: 1, stateid: 2, cityid: 3 }
    ]);

    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });

    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 101, name: 'Arenal', countryid: 1, stateid: 2, cityid: 3, Country: null, State: null, City: null }
    ]);

    repoMethods.getItineraryVotesSummaryByTripId.mockResolvedValue({ 101: 5 });

    repoMethods.getMembersListByTripId.mockResolvedValue([{ userid: 11 }, { userid: 12 }]);

    repoMethods.getItineraryVotesByMembersByTripId.mockResolvedValue({ 101: 2 });

    repoMethods.getUserItineraryVotesByTripIdAndUserId.mockResolvedValue(new Set([101]));

    const result = await tripsService.getTripById(20, 11, ['itinerary']);

    expect(result.itinerary.length).toBe(1);
    expect(result.itinerary[0].votes).toEqual({ general: 5, members: 2, total_votes: 7 });
    expect(result.itinerary[0].userVoted).toBe(true);
    expect(result.owner).toBeUndefined();
  });

  test('uploadImages throws notFound when trip is missing', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue(null);

    await expect(tripsService.uploadImages(99, [])).rejects.toMatchObject({
      statusCode: 404,
      message: 'Trip not found'
    });
  });

  test('getTripsByOwner additinerary throws badRequest when placeids are missing', async () => {
    repoMethods.searchTrips.mockResolvedValue([{ id: 1 }]);

    await expect(
      tripsService.getTripsByOwner(55, 1, 50, { action: 'additinerary', placeIds: [] })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'placeid/placeids is required when action=additinerary'
    });
  });

  test('createItinerary avoids duplicates and appends only new items', async () => {
    repoMethods.getItineraryByTripId.mockResolvedValue([
      { id: 1, placeid: 5, initialdate: '2026-03-01', finaldate: '2026-03-02' }
    ]);

    repoMethods.addItineraryPlace.mockResolvedValue([
      { id: 2, placeid: 8, initialdate: '2026-03-03', finaldate: '2026-03-04' }
    ]);

    const result = await tripsService.createItinerary(30, [
      { placeid: 5, initialdate: '2026-03-01', finaldate: '2026-03-02' },
      { placeid: 8, initialdate: '2026-03-03', finaldate: '2026-03-04' }
    ]);

    expect(repoMethods.addItineraryPlace).toHaveBeenCalledTimes(1);
    expect(result.length).toBe(2);
  });

  test('addItineraryPlace throws notFound when trip does not exist', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue(null);

    await expect(tripsService.addItineraryPlace(123, { placeid: 5 })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Trip not found'
    });
  });

  test('updateMemberList sends added/removed emails and recreates list', async () => {
    repoMethods.getMembersListByTripIds.mockResolvedValue([{ id: 1, userid: 100 }, { id: 2, userid: 200 }]);

    repoMethods.getTripByIdRaw.mockResolvedValue({ id: 88, name: 'Pacific Route', ownerid: 500 });

    repoMethods.getOwnerById.mockResolvedValue({ id: 500, name: 'Owner', tag: 'owner500' });

    repoMethods.getUsersByIds
      .mockResolvedValueOnce([{ id: 300, name: 'Added', email: 'added@mail.com' }])
      .mockResolvedValueOnce([{ id: 100, name: 'Removed', email: 'removed@mail.com' }]);

    repoMethods.deleteMemberItem.mockResolvedValue(undefined);
    repoMethods.createMemberList.mockResolvedValue([{ userid: 200 }, { userid: 300 }]);

    const result = await tripsService.updateMemberList(88, [{ userid: 200 }, { userid: 300 }]);

    expect(mockSendAddedToTripEmail).toHaveBeenCalledTimes(1);
    expect(mockSendRemovedFromTripEmail).toHaveBeenCalledTimes(1);
    expect(repoMethods.deleteMemberItem).toHaveBeenCalledTimes(2);
    expect(repoMethods.createMemberList).toHaveBeenCalledWith(88, [{ userid: 200 }, { userid: 300 }]);
    expect(result).toEqual([{ userid: 200 }, { userid: 300 }]);
  });

  test('deleteImage throws notFound when trip is missing', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue(null);

    await expect(tripsService.deleteImage(1, 2)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Trip not found'
    });
  });

  test('setCoverImage resets covers and updates the trip cover url', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({ id: 99 });
    repoMethods.getGalleryImageForTrip.mockResolvedValue({ completeurl: 'https://img/777.jpg' });

    const result = await tripsService.setCoverImage(99, 777);

    expect(repoMethods.resetGalleryCoversByTripId).toHaveBeenCalledWith(99);
    expect(repoMethods.setGalleryImageCover).toHaveBeenCalledWith(777, true);
    expect(repoMethods.updateTripCoverUrl).toHaveBeenCalledWith(99, 'https://img/777.jpg');
    expect(result).toEqual({ message: 'Cover image updated successfully', coverUrl: 'https://img/777.jpg' });
  });
});
