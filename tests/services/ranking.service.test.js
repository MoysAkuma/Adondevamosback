import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const repoMethods = {
  getLatestRankingRow: jest.fn(),
  getPlacesByIds: jest.fn(),
  getTripsByIds: jest.fn()
};

const mockRankingRepoConstructor = jest.fn(() => repoMethods);

jest.unstable_mockModule('../../src/repositories/ranking.repository.js', () => ({
  default: mockRankingRepoConstructor
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  publicServiceClient: {},
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

  test('getTopVotedEntities throws badRequest for invalid entity type', async () => {
    await expect(rankingService.getTopVotedEntities('users', 5)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Invalid entity type')
    });
    expect(repoMethods.getLatestRankingRow).not.toHaveBeenCalled();
  });

  test('getTopVotedEntities routes to places repository and wraps response', async () => {
    repoMethods.getLatestRankingRow.mockResolvedValue({
      first: 1, second: 2, third: null, count_first: 10, count_second: 4, count_third: 0
    });
    repoMethods.getPlacesByIds.mockResolvedValue([{ id: 1, name: 'Park' }, { id: 2, name: 'Beach' }]);

    const result = await rankingService.getTopVotedEntities('places', 3);

    expect(repoMethods.getLatestRankingRow).toHaveBeenCalledWith('votes_results_places');
    expect(repoMethods.getPlacesByIds).toHaveBeenCalledWith([1, 2]);
    expect(result).toEqual({
      entityType: 'places',
      ranking: [
        { id: 1, name: 'Park', Votes: { Total: 10 } },
        { id: 2, name: 'Beach', Votes: { Total: 4 } }
      ]
    });
  });

  test('getTopVotedEntities routes to trips repository and wraps response', async () => {
    repoMethods.getLatestRankingRow.mockResolvedValue({
      first: 2, second: null, third: null, count_first: 7, count_second: null, count_third: null
    });
    repoMethods.getTripsByIds.mockResolvedValue([{ id: 2, name: 'Road trip' }]);

    const result = await rankingService.getTopVotedEntities('trips', 4);

    expect(repoMethods.getLatestRankingRow).toHaveBeenCalledWith('votes_results_trips');
    expect(repoMethods.getTripsByIds).toHaveBeenCalledWith([2]);
    expect(result).toEqual({
      entityType: 'trips',
      ranking: [{ id: 2, name: 'Road trip', Votes: { Total: 7 } }]
    });
  });

  test('getTopVotedEntities routes itineraries to the itinerary results table', async () => {
    repoMethods.getLatestRankingRow.mockResolvedValue({
      first: 9, second: null, third: null, count_first: 5, count_second: null, count_third: null
    });
    repoMethods.getTripsByIds.mockResolvedValue([{ id: 9, name: 'Week in Lisbon' }]);

    const result = await rankingService.getTopVotedEntities('itineraries', 2);

    expect(repoMethods.getLatestRankingRow).toHaveBeenCalledWith('votes_results_itinerary');
    expect(result).toEqual({
      entityType: 'itineraries',
      ranking: [{ id: 9, name: 'Week in Lisbon', Votes: { Total: 5 } }]
    });
  });

  test('getTopVotedEntities returns empty ranking when there is no results row', async () => {
    repoMethods.getLatestRankingRow.mockResolvedValue(null);

    const result = await rankingService.getTopVotedEntities('places', 3);

    expect(result).toEqual({ entityType: 'places', ranking: [] });
    expect(repoMethods.getPlacesByIds).not.toHaveBeenCalled();
  });

  test('getTopVotedEntities propagates repository errors', async () => {
    repoMethods.getLatestRankingRow.mockRejectedValue(new Error('database down'));

    await expect(rankingService.getTopVotedEntities('places', 3)).rejects.toThrow('database down');
  });

  test('getTopVotedEntities uses default limit of 3 when not provided', async () => {
    repoMethods.getLatestRankingRow.mockResolvedValue({
      first: 1, second: 2, third: 3, count_first: 1, count_second: 1, count_third: 1
    });
    repoMethods.getTripsByIds.mockResolvedValue([]);

    await rankingService.getTopVotedEntities('trips');

    expect(repoMethods.getTripsByIds).toHaveBeenCalledWith([1, 2, 3]);
  });
});
