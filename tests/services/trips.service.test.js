import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const repoMethods = {
  createTrip: jest.fn(),
  updateTrip: jest.fn(),
  deleteTrip: jest.fn(),
  getTripByIdRaw: jest.fn(),
  uploadImagesToStorage: jest.fn(),
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
  setCoverImage: jest.fn(),
  updateImagesMetadata: jest.fn()
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
    repoMethods.createTrip.mockResolvedValue({ status: 201, data: { id: 1 } });

    const result = await tripsService.createTrip({ name: 'Trip A' });

    expect(repoMethods.createTrip).toHaveBeenCalledWith({ name: 'Trip A' });
    expect(result.status).toBe(201);
  });

  test('updateTrip delegates to repository', async () => {
    repoMethods.updateTrip.mockResolvedValue({ status: 200, data: { id: 2 } });

    const result = await tripsService.updateTrip(2, { name: 'Updated' });

    expect(repoMethods.updateTrip).toHaveBeenCalledWith(2, { name: 'Updated' });
    expect(result.status).toBe(200);
  });

  test('deleteTrip delegates to repository', async () => {
    repoMethods.deleteTrip.mockResolvedValue({ status: 200, data: {} });

    const result = await tripsService.deleteTrip(3);

    expect(repoMethods.deleteTrip).toHaveBeenCalledWith(3);
    expect(result.status).toBe(200);
  });

  test('getTripById returns 404 when trip does not exist', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({ status: 200, data: [] });

    const result = await tripsService.getTripById(777);

    expect(result).toEqual({ status: 404, data: null });
  });

  test('getTripById returns base + owner when only owner field is requested', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({
      status: 200,
      data: [{
        id: 10,
        name: 'Andes',
        description: 'Desc',
        initialdate: '2026-01-01',
        finaldate: '2026-01-05',
        isinternational: true,
        orden: 1,
        cover_url: 'cover.webp',
        ownerid: 55
      }]
    });
    repoMethods.getOwnerById.mockResolvedValue({
      status: 200,
      data: [{ id: 55, tag: 'owner55', name: 'Moises' }]
    });

    const result = await tripsService.getTripById(10, null, ['owner']);

    expect(repoMethods.getOwnerById).toHaveBeenCalledWith(55);
    expect(repoMethods.getItineraryByTripId).not.toHaveBeenCalled();
    expect(repoMethods.getMembersListByTripId).not.toHaveBeenCalled();
    expect(result.status).toBe(200);
    expect(result.data.owner).toEqual({ id: 55, tag: 'owner55', name: 'Moises' });
    expect(result.data.gallery).toBeUndefined();
  });

  test('getTripById returns enriched itinerary with votes and userVoted flag', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({
      status: 200,
      data: [{
        id: 20,
        name: 'CR Tour',
        description: 'desc',
        initialdate: '2026-02-01',
        finaldate: '2026-02-08',
        isinternational: false,
        orden: 2,
        cover_url: null,
        ownerid: 7
      }]
    });

    repoMethods.getItineraryByTripId.mockResolvedValue({
      status: 200,
      data: [
        { placeid: 101, initialdate: '2026-02-02', finaldate: '2026-02-03', orden: 1 }
      ]
    });

    mockSearchPlacesByIDs.mockResolvedValue({
      status: 200,
      data: [{ id: 101, name: 'Arenal', countryid: 1, stateid: 2, cityid: 3 }]
    });

    mockGetUbicationNamesByIDs.mockResolvedValue({
      status: 200,
      data: { countries: [], states: [], cities: [] }
    });

    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 101, name: 'Arenal', countryid: 1, stateid: 2, cityid: 3, Country: null, State: null, City: null }
    ]);

    repoMethods.getItineraryVotesSummaryByTripId.mockResolvedValue({
      status: 200,
      data: { 101: 5 }
    });

    repoMethods.getMembersListByTripId.mockResolvedValue({
      status: 200,
      data: [{ userid: 11 }, { userid: 12 }]
    });

    repoMethods.getItineraryVotesByMembersByTripId.mockResolvedValue({
      status: 200,
      data: { 101: 2 }
    });

    repoMethods.getUserItineraryVotesByTripIdAndUserId.mockResolvedValue({
      status: 200,
      data: new Set([101])
    });

    const result = await tripsService.getTripById(20, 11, ['itinerary']);

    expect(result.status).toBe(200);
    expect(result.data.itinerary.length).toBe(1);
    expect(result.data.itinerary[0].votes).toEqual({ general: 5, members: 2, total_votes: 7 });
    expect(result.data.itinerary[0].userVoted).toBe(true);
    expect(result.data.owner).toBeUndefined();
  });

  test('uploadImages returns 404 when trip is missing', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({ status: 404, error: 'Trip not found' });

    const result = await tripsService.uploadImages(99, []);

    expect(result).toEqual({ status: 404, error: 'Trip not found' });
  });

  test('getTripsByOwner additinerary returns 400 when placeids are missing', async () => {
    repoMethods.searchTrips.mockResolvedValue({ status: 200, data: [{ id: 1 }], pagination: {} });

    const result = await tripsService.getTripsByOwner(55, 1, 50, { action: 'additinerary', placeIds: [] });

    expect(result).toEqual({ status: 400, message: 'placeid/placeids is required when action=additinerary' });
  });

  test('createItinerary avoids duplicates and appends only new items', async () => {
    repoMethods.getItineraryByTripId.mockResolvedValue({
      status: 200,
      data: [{ id: 1, placeid: 5, initialdate: '2026-03-01', finaldate: '2026-03-02' }]
    });

    repoMethods.addItineraryPlace.mockResolvedValue({
      status: 201,
      data: [{ id: 2, placeid: 8, initialdate: '2026-03-03', finaldate: '2026-03-04' }]
    });

    const result = await tripsService.createItinerary(30, [
      { placeid: 5, initialdate: '2026-03-01', finaldate: '2026-03-02' },
      { placeid: 8, initialdate: '2026-03-03', finaldate: '2026-03-04' }
    ]);

    expect(repoMethods.addItineraryPlace).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(201);
    expect(result.data.length).toBe(2);
  });

  test('addItineraryPlace returns 404 when trip does not exist', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({ status: 200, data: [] });

    const result = await tripsService.addItineraryPlace(123, { placeid: 5 });

    expect(result).toEqual({ status: 404, error: 'Trip not found' });
  });

  test('updateMemberList sends added/removed emails and recreates list', async () => {
    repoMethods.getMembersListByTripIds.mockResolvedValue({
      status: 200,
      data: [{ id: 1, userid: 100 }, { id: 2, userid: 200 }]
    });

    repoMethods.getTripByIdRaw.mockResolvedValue({
      status: 200,
      data: [{ id: 88, name: 'Pacific Route', ownerid: 500 }]
    });

    repoMethods.getOwnerById.mockResolvedValue({
      status: 200,
      data: [{ id: 500, name: 'Owner', tag: 'owner500' }]
    });

    repoMethods.getUsersByIds
      .mockResolvedValueOnce({ status: 200, data: [{ id: 300, name: 'Added', email: 'added@mail.com' }] })
      .mockResolvedValueOnce({ status: 200, data: [{ id: 100, name: 'Removed', email: 'removed@mail.com' }] });

    repoMethods.deleteMemberItem.mockResolvedValue({ status: 200 });
    repoMethods.createMemberList.mockResolvedValue({ status: 201, data: [{ userid: 200 }, { userid: 300 }] });

    const result = await tripsService.updateMemberList(88, [{ userid: 200 }, { userid: 300 }]);

    expect(mockSendAddedToTripEmail).toHaveBeenCalledTimes(1);
    expect(mockSendRemovedFromTripEmail).toHaveBeenCalledTimes(1);
    expect(repoMethods.deleteMemberItem).toHaveBeenCalledTimes(2);
    expect(repoMethods.createMemberList).toHaveBeenCalledWith(88, [{ userid: 200 }, { userid: 300 }]);
    expect(result.status).toBe(201);
  });

  test('deleteImage returns 404 when trip is missing', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({ status: 200, data: [] });

    const result = await tripsService.deleteImage(1, 2);

    expect(result).toEqual({ status: 404, error: 'Trip not found' });
  });

  test('setCoverImage delegates when trip exists', async () => {
    repoMethods.getTripByIdRaw.mockResolvedValue({ status: 200, data: [{ id: 99 }] });
    repoMethods.setCoverImage.mockResolvedValue({ status: 200, data: 'ok' });

    const result = await tripsService.setCoverImage(99, 777);

    expect(repoMethods.setCoverImage).toHaveBeenCalledWith(99, 777);
    expect(result).toEqual({ status: 200, data: 'ok' });
  });
});
