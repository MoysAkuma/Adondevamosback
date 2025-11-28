import TripsRepository from '../../src/repositories/trips.repository.js';

describe('TripsRepository', () => {
  let tripsClientMock;
  let usersClientMock;
  let repo;

  const makeQueryMock = (response) => ({
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue(response),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  });

  beforeEach(() => {
    tripsClientMock = {
      from: jest.fn((table) => {
        return makeQueryMock(currentResponse);
      })
    };
    usersClientMock = {
      from: jest.fn((table) => {
        return makeQueryMock(currentResponse);
      })
    };
    // dynamic response holder
    global.currentResponse = { data: {}, error: null };
    repo = new TripsRepository({ tripsClient: tripsClientMock, usersClient: usersClientMock });
  });

  test('createTrip success', async () => {
    global.currentResponse = { data: { id: 1, name: 'Trip' }, error: null };
    const res = await repo.createTrip({ name: 'Trip' });
    expect(res.status).toBe(201);
    expect(res.data.id).toBe(1);
  });

  test('createTrip error', async () => {
    global.currentResponse = { data: null, error: { message: 'fail' } };
    const res = await repo.createTrip({ name: 'Trip' });
    expect(res.status).toBe(500);
    expect(res.error.message).toBe('fail');
  });

  test('getTripByIdRaw success', async () => {
    global.currentResponse = { data: [{ id: 9 }], error: null };
    const res = await repo.getTripByIdRaw(9);
    expect(res.status).toBe(200);
    expect(res.data[0].id).toBe(9);
  });

  test('getOwnerById error', async () => {
    global.currentResponse = { data: null, error: { message: 'owner error' } };
    const res = await repo.getOwnerById(3);
    expect(res.status).toBe(500);
    expect(res.error.message).toBe('owner error');
  });

  test('getMembersListByTripId success', async () => {
    global.currentResponse = { data: [{ id: 1, userid: 5 }], error: null };
    const res = await repo.getMembersListByTripId(10);
    expect(res.status).toBe(200);
    expect(res.data.length).toBe(1);
  });
});

// Minimal Jest setup hint (add to package.json):
// "scripts": { "test": "jest" }
// Install: npm i -D jest @jest/globals
// If using ES modules, create jest.config.cjs with: module.exports = { testEnvironment: 'node', transform: {} };