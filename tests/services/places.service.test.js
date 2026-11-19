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
  countPlaces: jest.fn(),
  searchPlaces: jest.fn(),
  getGalleryImagesByPlaceIds: jest.fn(),
  searchPlacesByField: jest.fn(),
  uploadGalleryFile: jest.fn(),
  getGalleryPublicUrl: jest.fn(),
  saveImageUrlsToPlace: jest.fn(),
  updateFacilities: jest.fn(),
  addFacilities: jest.fn(),
  getNewPlaces: jest.fn(),
  getGalleryImage: jest.fn(),
  removeGalleryFiles: jest.fn(),
  deleteGalleryImage: jest.fn(),
  resetGalleryCovers: jest.fn(),
  setGalleryImageCover: jest.fn(),
  updatePlaceCoverUrl: jest.fn()
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
    repoMethods.createPlace.mockResolvedValue({ id: 1 });

    const result = await placesService.createPlace({ name: 'Place A' });

    expect(repoMethods.createPlace).toHaveBeenCalledWith({ name: 'Place A' });
    expect(result).toEqual({ id: 1 });
  });

  test('updatePlace delegates to repository', async () => {
    repoMethods.updatePlace.mockResolvedValue({ id: 2 });

    const result = await placesService.updatePlace(2, { name: 'New Name' });

    expect(repoMethods.updatePlace).toHaveBeenCalledWith(2, { name: 'New Name' });
    expect(result).toEqual({ id: 2 });
  });

  test('deletePlace delegates to repository', async () => {
    repoMethods.deletePlace.mockResolvedValue([]);

    const result = await placesService.deletePlace(3);

    expect(repoMethods.deletePlace).toHaveBeenCalledWith(3);
    expect(result).toEqual([]);
  });

  test('getPlaceById throws notFound when base place has no data', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([]);

    await expect(placesService.getPlaceById(100)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Place not found'
    });
  });

  test('getPlaceById returns fully enriched place when all dependencies succeed', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([{ id: 10, name: 'Park', countryid: 1, stateid: 2, cityid: 3 }]);
    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });
    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 10, name: 'Park', countryid: 1, stateid: 2, cityid: 3, Country: null, State: null, City: null }
    ]);
    repoMethods.getFacilitiesByPlaceId.mockResolvedValue([{ name: 'Wifi', code: 'WIFI' }]);
    repoMethods.getVotesByPlaceIdSummary.mockResolvedValue(7);
    repoMethods.getUserVoteByPlaceIdAndUserId.mockResolvedValue([{ id: 1, value: true }]);
    repoMethods.getGalleryByPlaceId.mockResolvedValue([{ id: 1, url: 'https://cdn/image.webp' }]);

    const result = await placesService.getPlaceById(10, 99);

    expect(mockGetUbicationNamesByIDs).toHaveBeenCalledWith([
      { id: 10, name: 'Park', countryid: 1, stateid: 2, cityid: 3 }
    ]);
    expect(repoMethods.getUserVoteByPlaceIdAndUserId).toHaveBeenCalledWith(10, 99);
    expect(result.id).toBe(10);
    expect(result.facilities).toEqual([{ name: 'Wifi', code: 'WIFI' }]);
    expect(result.statics).toEqual({ Votes: { Total: 7 } });
    expect(result.userVote).toBe(true);
    expect(result.gallery).toEqual([{ id: 1, url: 'https://cdn/image.webp' }]);
    expect(result.countryid).toBeUndefined();
    expect(result.stateid).toBeUndefined();
    expect(result.cityid).toBeUndefined();
  });

  test('searchPlaces returns mapped list without ids used for ubication', async () => {
    repoMethods.countPlaces.mockResolvedValue(1);
    repoMethods.searchPlaces.mockResolvedValue([
      { id: 1, name: 'Beach', countryid: 1, stateid: 2, cityid: 3, address: 'X' }
    ]);
    repoMethods.getGalleryImagesByPlaceIds.mockResolvedValue([]);
    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });
    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 1, name: 'Beach', countryid: 1, stateid: 2, cityid: 3, address: 'X', Country: null, State: null, City: null }
    ]);

    const result = await placesService.searchPlaces({ name: 'Bea' });

    expect(repoMethods.searchPlaces).toHaveBeenCalled();
    expect(result.data[0].countryid).toBeUndefined();
    expect(result.data[0].stateid).toBeUndefined();
    expect(result.data[0].cityid).toBeUndefined();
    expect(result.pagination.totalCount).toBe(1);
  });

  test('searchPlaces returns empty data and pagination when no places match', async () => {
    repoMethods.countPlaces.mockResolvedValue(0);

    const result = await placesService.searchPlaces({});

    expect(result.data).toEqual([]);
    expect(result.pagination).toMatchObject({ totalCount: 0, totalPages: 0, hasNextPage: false });
    expect(repoMethods.searchPlaces).not.toHaveBeenCalled();
  });

  test('searchPlacesByField enriches mapped places', async () => {
    repoMethods.searchPlacesByField.mockResolvedValue([
      { id: 6, name: 'River', countryid: 1, stateid: 2, cityid: 3 }
    ]);
    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });
    mockMapPlacesWithUbicationNames.mockReturnValue([
      { id: 6, name: 'River', countryid: 1, stateid: 2, cityid: 3, Country: null, State: null, City: null }
    ]);

    const result = await placesService.searchPlacesByField('name', 'riv');

    expect(repoMethods.searchPlacesByField).toHaveBeenCalledWith('name', 'riv', 'id,name,countryid,stateid,cityid');
    expect(result[0].countryid).toBeUndefined();
  });

  test('uploadImages validates place exists before saving images', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([{ id: 11 }]);
    repoMethods.uploadGalleryFile.mockResolvedValue(undefined);
    repoMethods.getGalleryPublicUrl.mockReturnValue('https://cdn/places/11.jpg');
    repoMethods.saveImageUrlsToPlace.mockResolvedValue([{ id: 1 }]);

    const result = await placesService.uploadImages(11, [{ buffer: Buffer.from('img'), extension: 'jpg' }]);

    expect(repoMethods.uploadGalleryFile).toHaveBeenCalledWith(expect.stringMatching(/^places\/11_\d+_0\.jpg$/), expect.anything(), 'image/jpeg');
    expect(repoMethods.saveImageUrlsToPlace).toHaveBeenCalledWith(11, [
      expect.objectContaining({ url: 'https://cdn/places/11.jpg', iscover: false })
    ]);
    expect(result).toEqual([{ id: 1 }]);
  });

  test('updateFacilities throws notFound when place does not exist', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([]);

    await expect(placesService.updateFacilities(90, [{ facilityid: 1, value: true }])).rejects.toMatchObject({
      statusCode: 404,
      message: 'Place not found'
    });
  });

  test('addFacilities maps created facilities to id-only response', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([{ id: 20 }]);
    repoMethods.addFacilities.mockResolvedValue([
      { id: 1, placeid: 20, facilityid: 3 },
      { id: 2, placeid: 20, facilityid: 4 }
    ]);

    const result = await placesService.addFacilities(20, [{ facilityid: 3 }, { facilityid: 4 }]);

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('getNewPlaces enriches every place and returns only successful ones', async () => {
    repoMethods.getNewPlaces.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    repoMethods.getPlaceByIdRaw
      .mockResolvedValueOnce([{ id: 1, name: 'A', countryid: 1, stateid: 1, cityid: 1 }])
      .mockResolvedValueOnce([{ id: 2, name: 'B', countryid: 1, stateid: 1, cityid: 1 }]);

    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });

    mockMapPlacesWithUbicationNames
      .mockReturnValueOnce([{ id: 1, name: 'A', countryid: 1, stateid: 1, cityid: 1 }])
      .mockReturnValueOnce([{ id: 2, name: 'B', countryid: 1, stateid: 1, cityid: 1 }]);

    repoMethods.getFacilitiesByPlaceId.mockResolvedValue([]);
    repoMethods.getVotesByPlaceIdSummary.mockResolvedValue(0);
    repoMethods.getGalleryByPlaceId.mockResolvedValue([]);

    const result = await placesService.getNewPlaces(2, null);

    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  test('deleteImage throws notFound when place does not exist', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([]);

    await expect(placesService.deleteImage(33, 5)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Place not found'
    });
  });

  test('setCoverImage updates cover when place and image exist', async () => {
    repoMethods.getPlaceByIdRaw.mockResolvedValue([{ id: 77 }]);
    repoMethods.getGalleryImage.mockResolvedValue({ completeurl: 'https://cdn/cover.webp' });
    repoMethods.resetGalleryCovers.mockResolvedValue(undefined);
    repoMethods.setGalleryImageCover.mockResolvedValue(undefined);
    repoMethods.updatePlaceCoverUrl.mockResolvedValue(undefined);

    const result = await placesService.setCoverImage(77, 1001);

    expect(repoMethods.setGalleryImageCover).toHaveBeenCalledWith(1001);
    expect(repoMethods.updatePlaceCoverUrl).toHaveBeenCalledWith(77, 'https://cdn/cover.webp');
    expect(result).toEqual({ message: 'Cover image updated successfully', coverUrl: 'https://cdn/cover.webp' });
  });
});
