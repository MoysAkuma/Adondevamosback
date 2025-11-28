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
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis()
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
    expect(res.status).toBe(201);
    expect(res.data.id).toBe(7);
  });

  test('createPlace error', async () => {
    currentResponse = { data: null, error: { message: 'insert fail' } };
    const res = await repo.createPlace({ name: 'X' });
    expect(res.status).toBe(500);
    expect(res.error.message).toBe('insert fail');
  });

  test('getPlaceByIdRaw success', async () => {
    currentResponse = { data: [{ id: 3 }], error: null };
    const res = await repo.getPlaceByIdRaw(3);
    expect(res.status).toBe(200);
    expect(res.data[0].id).toBe(3);
  });

  test('searchPlacesByIDs empty list returns empty data', async () => {
    const res = await repo.searchPlacesByIDs([]);
    expect(res.status).toBe(200);
    expect(res.data).toEqual([]);
    expect(placesClientMock.from).not.toHaveBeenCalled();
  });

  test('searchPlacesByIDs success', async () => {
    currentResponse = { data: [{ id: 1 }, { id: 2 }], error: null };
    const res = await repo.searchPlacesByIDs([1, 2]);
    expect(res.status).toBe(200);
    expect(res.data.length).toBe(2);
  });

  test('updatePlace error', async () => {
    currentResponse = { data: null, error: { message: 'update fail' } };
    const res = await repo.updatePlace(9, { name: 'New' });
    expect(res.status).toBe(500);
    expect(res.error.message).toBe('update fail');
  });
});

// Jest setup (if needed):
// package.json: "scripts": { "test": "jest" }
// npm i -D jest @jest/globals
// jest.config.cjs: module.exports = { testEnvironment: 'node' };