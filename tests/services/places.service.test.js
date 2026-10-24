import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const repoMethods = {
  getPlaceByIdRaw: jest.fn(),
  getFacilitiesByPlaceId: jest.fn(),
  getVotesByPlaceIdSummary: jest.fn(),
  getUserVoteByPlaceIdAndUserId: jest.fn(),
  getGalleryByPlaceId: jest.fn(),
  createPlace: jest.fn(),
  updatePlace: jest.fn(),
  deletePlace: jest.fn(),
  searchPlacesByIDs: jest.fn(),
  searchPlaces: jest.fn(),
  searchPlacesByField: jest.fn(),
  uploadImagesToStorage: jest.fn(),
  saveImageUrlsToPlace: jest.fn(),
  updateFacilities: jest.fn(),
  addFacilities: jest.fn(),
  getNewPlaces: jest.fn(),
  deleteImageFromGallery: jest.fn(),
  setCoverImage: jest.fn()
};

const mockPlacesRepoConstructor = jest.fn(() => repoMethods);
const mockGetUbicationNamesByIDs = jest.fn();
const mockMapPlacesWithUbicationNames = jest.fn();

jest.unstable_mockModule('../../src/repositories/places.repository.js', () => ({
  default: mockPlacesRepoConstructor
}));

jest.unstable_mockModule('../../src/mappers/ubication.mapper.js', () => ({
  mapPlacesWithUbicationNames: mockMapPlacesWithUbicationNames
}));

jest.unstable_mockModule('../../src/services/ubication.service.js', () => ({
  default: {
    getUbicationNamesByIDs: mockGetUbicationNamesByIDs
  }
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  clientPlaces: {},
  cataloguesClient: {},
  votesClient: {}
}));

const { default: placesService } = await import('../../src/services/places.service.js');

describe('places.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createPlace delegates to repository', async () => {
    repoMethods.createPlace.mockResolvedValue({ status: 201, data: { id: 1 } });

    const result = await placesService.createPlace({ name: 'Place A' });

    expect(repoMethods.createPlace).toHaveBeenCalledWith({ name: 'Place A' });
    expect(result.status).toBe(201);
  });

  test('updatePlace delegates to repository', async () => {
    repoMethods.updatePlace.mockResolvedValue({ status: 200, data: { id: 2 } });

    const result = await placesService.updatePlace(2, { name: 'New Name' });

    expect(repoMethods.updatePlace).toHaveBeenCalledWith(2, { name: 'New Name' });
    expect(result.status).toBe(200);
  });

  test('deletePlace delegates to repository', async () => {
    repoMethods.deletePlace.mockResolvedValue({ status: 200, data: {} });

    const result = await placesService.deletePlace(3);

    expect(repoMethods.deletePlace).toHaveBeenCalledWith(3);
    expect(result.status).toBe(200);
  });

  test('getPlaceById returns 404 when base place has no data', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({ status: 200, data: [] });

    const result = await placesService.getPlaceById(100);

    expect(result).toEqual({ status: 404, data: null });
  });

  test('getPlaceById returns fully enriched place when all dependencies succeed', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({
      status: 200,
      data: [{ id: 10, name: 'Park', countryid: 1, stateid: 2, cityid: 3 }]
    });
    mockGetUbicationNamesByIDs.mockResolvedValue({
      status: 200,
      data: { countries: [], states: [], cities: [] }
    });
    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 10, name: 'Park', countryid: 1, stateid: 2, cityid: 3, Country: null, State: null, City: null }
    ]);
    repoMethods.getFacilitiesByPlaceId.mockResolvedValue({
      status: 200,
      data: [{ name: 'Wifi', code: 'WIFI' }]
    });
    repoMethods.getVotesByPlaceIdSummary.mockResolvedValue({
      status: 200,
      data: [{ total: 7 }]
    });
    repoMethods.getUserVoteByPlaceIdAndUserId.mockResolvedValue({
      status: 200,
      data: { value: true }
    });
    repoMethods.getGalleryByPlaceId.mockResolvedValue({
      status: 200,
      data: [{ id: 1, url: 'https://cdn/image.webp' }]
    });

    const result = await placesService.getPlaceById(10, 99);

    expect(mockGetUbicationNamesByIDs).toHaveBeenCalledWith([
      { id: 10, name: 'Park', countryid: 1, stateid: 2, cityid: 3 }
    ]);
    expect(repoMethods.getUserVoteByPlaceIdAndUserId).toHaveBeenCalledWith(10, 99);
    expect(result.status).toBe(200);
    expect(result.data.id).toBe(10);
    expect(result.data.facilities).toEqual([{ name: 'Wifi', code: 'WIFI' }]);
    expect(result.data.statics).toEqual({ Votes: { Total: 7 } });
    expect(result.data.userVote).toBe(true);
    expect(result.data.gallery).toEqual([{ id: 1, url: 'https://cdn/image.webp' }]);
    expect(result.data.countryid).toBeUndefined();
    expect(result.data.stateid).toBeUndefined();
    expect(result.data.cityid).toBeUndefined();
  });

  test('searchPlaces returns mapped list without ids used for ubication', async () => {
    repoMethods.searchPlaces.mockResolvedValue({
      status: 200,
      data: [{ id: 1, name: 'Beach', countryid: 1, stateid: 2, cityid: 3, address: 'X' }]
    });
    mockGetUbicationNamesByIDs.mockResolvedValue({
      status: 200,
      data: { countries: [], states: [], cities: [] }
    });
    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 1, name: 'Beach', countryid: 1, stateid: 2, cityid: 3, address: 'X', Country: null, State: null, City: null }
    ]);

    const result = await placesService.searchPlaces({ name: 'Bea' });

    expect(repoMethods.searchPlaces).toHaveBeenCalled();
    expect(result.status).toBe(200);
    expect(result.data[0].countryid).toBeUndefined();
    expect(result.data[0].stateid).toBeUndefined();
    expect(result.data[0].cityid).toBeUndefined();
  });

  test('searchPlaces returns 404 when repository yields empty data', async () => {
    repoMethods.searchPlaces.mockResolvedValue({ status: 200, data: [] });

    const result = await placesService.searchPlaces({});

    expect(result).toEqual({ status: 404, message: 'No results to show' });
  });

  test('searchPlacesByField enriches mapped places', async () => {
    repoMethods.searchPlacesByField.mockResolvedValue({
      status: 200,
      data: [{ id: 6, name: 'River', countryid: 1, stateid: 2, cityid: 3 }]
    });
    mockGetUbicationNamesByIDs.mockResolvedValue({
      status: 200,
      data: { countries: [], states: [], cities: [] }
    });
    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 6, name: 'River', countryid: 1, stateid: 2, cityid: 3, Country: null, State: null, City: null }
    ]);

    const result = await placesService.searchPlacesByField('name', 'riv');

    expect(repoMethods.searchPlacesByField).toHaveBeenCalledWith('name', 'riv', 'id,name,countryid,stateid,cityid');
    expect(result.status).toBe(200);
    expect(result.data[0].countryid).toBeUndefined();
  });

  test('uploadImages validates place exists before saving images', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({ status: 200, data: [{ id: 11 }] });
    repoMethods.uploadImagesToStorage.mockResolvedValue({
      status: 200,
      data: [{ image_url: 'x.webp' }]
    });
    repoMethods.saveImageUrlsToPlace.mockResolvedValue({ status: 200, data: { ok: true } });

    const result = await placesService.uploadImages(11, [{ originalname: 'x.webp' }]);

    expect(repoMethods.uploadImagesToStorage).toHaveBeenCalledWith(11, [{ originalname: 'x.webp' }]);
    expect(repoMethods.saveImageUrlsToPlace).toHaveBeenCalledWith(11, [{ image_url: 'x.webp' }]);
    expect(result.status).toBe(200);
  });

  test('updateFacilities returns 404 when place does not exist', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({ status: 200, data: [] });

    const result = await placesService.updateFacilities(90, [{ facilityid: 1, value: true }]);

    expect(result).toEqual({ status: 404, error: 'Place not found' });
  });

  test('addFacilities maps created facilities to id-only response', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({ status: 200, data: [{ id: 20 }] });
    repoMethods.addFacilities.mockResolvedValue({
      status: 200,
      data: [{ id: 1, placeid: 20, facilityid: 3 }, { id: 2, placeid: 20, facilityid: 4 }]
    });

    const result = await placesService.addFacilities(20, [{ facilityid: 3 }, { facilityid: 4 }]);

    expect(result).toEqual({ status: 200, data: [{ id: 1 }, { id: 2 }] });
  });

  test('getNewPlaces enriches every place and returns only successful ones', async () => {
    repoMethods.getNewPlaces.mockResolvedValue({
      status: 200,
      data: [{ id: 1 }, { id: 2 }]
    });

    repoMethods.getPlaceByIdRaw
      .mockResolvedValueOnce({ status: 200, data: [{ id: 1, name: 'A', countryid: 1, stateid: 1, cityid: 1 }] })
      .mockResolvedValueOnce({ status: 200, data: [{ id: 2, name: 'B', countryid: 1, stateid: 1, cityid: 1 }] });

    mockGetUbicationNamesByIDs.mockResolvedValue({ status: 200, data: { countries: [], states: [], cities: [] } });

    mockMapPlacesWithUbicationNames
      .mockReturnValueOnce([{ id: 1, name: 'A', countryid: 1, stateid: 1, cityid: 1 }])
      .mockReturnValueOnce([{ id: 2, name: 'B', countryid: 1, stateid: 1, cityid: 1 }]);

    repoMethods.getFacilitiesByPlaceId.mockResolvedValue({ status: 200, data: [] });
    repoMethods.getVotesByPlaceIdSummary.mockResolvedValue({ status: 200, data: [{ total: 0 }] });
    repoMethods.getGalleryByPlaceId.mockResolvedValue({ status: 200, data: [] });

    const result = await placesService.getNewPlaces(2, null);

    expect(result.status).toBe(200);
    expect(result.data.length).toBe(2);
    expect(result.data[0].id).toBe(1);
    expect(result.data[1].id).toBe(2);
  });

  test('deleteImage returns 404 when place does not exist', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({ status: 200, data: [] });

    const result = await placesService.deleteImage(33, 5);

    expect(result).toEqual({ status: 404, error: 'Place not found' });
  });

  test('setCoverImage delegates to repository when place exists', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue({ status: 200, data: [{ id: 77 }] });
    repoMethods.setCoverImage.mockResolvedValue({ status: 200, data: 'ok' });

    const result = await placesService.setCoverImage(77, 1001);

    expect(repoMethods.setCoverImage).toHaveBeenCalledWith(77, 1001);
    expect(result).toEqual({ status: 200, data: 'ok' });
  });
});
