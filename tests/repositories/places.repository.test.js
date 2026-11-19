import PlacesRepository from '../../src/repositories/places.repository.js';

describe('PlacesRepository', () => {
  let placesClientMock;
  let repo;
  let currentResponse;

  const chainMock = () => ({
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue(currentResponse),
    maybeSingle: jest.fn().mockReturnValue(currentResponse),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    then: (resolve, reject) => Promise.resolve(currentResponse).then(resolve, reject)
  });

  beforeEach(() => {
    currentResponse = { data: null, error: null };
    placesClientMock = {
      from: jest.fn(() => chainMock())
    };
    repo = new PlacesRepository({ placesClient: placesClientMock });
  });

  test('createPlace success', async () => {
    currentResponse = { data: { id: 7, name: 'Place A' }, error: null };
    const res = await repo.createPlace({ name: 'Place A' });
    expect(res.id).toBe(7);
  });

  test('createPlace error', async () => {
    currentResponse = { data: null, error: { message: 'insert fail' } };
    await expect(repo.createPlace({ name: 'X' })).rejects.toMatchObject({ statusCode: 500, message: 'insert fail' });
  });

  test('getPlaceByIdRaw success', async () => {
    currentResponse = { data: [{ id: 3 }], error: null };
    const res = await repo.getPlaceByIdRaw(3);
    expect(res[0].id).toBe(3);
  });

  test('searchPlacesByIDs empty list returns empty array', async () => {
    const res = await repo.searchPlacesByIDs([]);
    expect(res).toEqual([]);
    expect(placesClientMock.from).not.toHaveBeenCalled();
  });

  test('searchPlacesByIDs success', async () => {
    currentResponse = { data: [{ id: 1 }, { id: 2 }], error: null };
    const res = await repo.searchPlacesByIDs([1, 2]);
    expect(res.length).toBe(2);
  });

  test('updatePlace error', async () => {
    currentResponse = { data: null, error: { message: 'update fail' } };
    await expect(repo.updatePlace(9, { name: 'New' })).rejects.toMatchObject({ statusCode: 500, message: 'update fail' });
  });
});

// Jest setup (if needed):
// package.json: "scripts": { "test": "jest" }
// npm i -D jest @jest/globals
// jest.config.cjs: module.exports = { testEnvironment: 'node' };