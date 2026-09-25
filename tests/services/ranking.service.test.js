import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const repoMethods = {
  getTopVotedPlaces: jest.fn(),
  getTopVotedTrips: jest.fn(),
  getTopVotedItineraries: jest.fn()
};

const mockRankingRepoConstructor = jest.fn(() => repoMethods);

jest.unstable_mockModule('../../src/repositories/ranking.repository.js', () => ({
  default: mockRankingRepoConstructor
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  votesClient: {},
  clientPlaces: {},
  clientTrips: {}
}));

const { default: rankingService } = await import('../../src/services/ranking.service.js');

describe('ranking.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getValidEntityTypes returns supported types', () => {
    const result = rankingService.getValidEntityTypes();

    expect(result).toEqual(['places', 'trips', 'itineraries']);
  });

  test('getTopVotedEntities returns 400 for invalid entity type', async () => {
    const result = await rankingService.getTopVotedEntities('users', 5);

    expect(result.status).toBe(400);
    expect(result.error).toContain('Invalid entity type');
    expect(repoMethods.getTopVotedPlaces).not.toHaveBeenCalled();
    expect(repoMethods.getTopVotedTrips).not.toHaveBeenCalled();
    expect(repoMethods.getTopVotedItineraries).not.toHaveBeenCalled();
  });

  test('getTopVotedEntities routes to places repository and wraps response', async () => {
    repoMethods.getTopVotedPlaces.mockResolvedValue({
      status: 200,
      data: [{ placeid: 1, votes: 10 }]
    });

    const result = await rankingService.getTopVotedEntities('places', 3);

    expect(repoMethods.getTopVotedPlaces).toHaveBeenCalledWith(3);
    expect(result).toEqual({
      status: 200,
      data: {
        entityType: 'places',
        ranking: [{ placeid: 1, votes: 10 }]
      }
    });
  });

  test('getTopVotedEntities routes to trips repository and wraps response', async () => {
    repoMethods.getTopVotedTrips.mockResolvedValue({
      status: 200,
      data: [{ tripid: 2, votes: 7 }]
    });

    const result = await rankingService.getTopVotedEntities('trips', 4);

    expect(repoMethods.getTopVotedTrips).toHaveBeenCalledWith(4);
    expect(result).toEqual({
      status: 200,
      data: {
        entityType: 'trips',
        ranking: [{ tripid: 2, votes: 7 }]
      }
    });
  });

  test('getTopVotedEntities routes to itineraries repository and wraps response', async () => {
    repoMethods.getTopVotedItineraries.mockResolvedValue({
      status: 200,
      data: [{ itineraryid: 9, votes: 5 }]
    });

    const result = await rankingService.getTopVotedEntities('itineraries', 2);

    expect(repoMethods.getTopVotedItineraries).toHaveBeenCalledWith(2);
    expect(result).toEqual({
      status: 200,
      data: {
        entityType: 'itineraries',
        ranking: [{ itineraryid: 9, votes: 5 }]
      }
    });
  });

  test('getTopVotedEntities returns repository error response unchanged', async () => {
    repoMethods.getTopVotedPlaces.mockResolvedValue({ status: 500, error: 'database down' });

    const result = await rankingService.getTopVotedEntities('places', 3);

    expect(result).toEqual({ status: 500, error: 'database down' });
  });

  test('getTopVotedEntities uses default limit when not provided', async () => {
    repoMethods.getTopVotedTrips.mockResolvedValue({
      status: 200,
      data: [{ tripid: 1, votes: 1 }]
    });

    await rankingService.getTopVotedEntities('trips');

    expect(repoMethods.getTopVotedTrips).toHaveBeenCalledWith(3);
  });
});
