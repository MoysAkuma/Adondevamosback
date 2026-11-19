import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const votesRepo = {
  getUserVoteByTripIdAndUserId: jest.fn(),
  updateVoteTrips: jest.fn(),
  createVoteTrips: jest.fn(),
  getUserVoteByItineraryTripIdPlaceIdAndUserId: jest.fn(),
  updateVoteItinerary: jest.fn(),
  createVoteItinerary: jest.fn(),
  getUserVoteByPlaceIdAndUserId: jest.fn(),
  updateVotePlace: jest.fn(),
  createVotePlace: jest.fn(),
  updateVote: jest.fn(),
  getVotesByTripId: jest.fn(),
  getVotesByPlaceId: jest.fn(),
  getTrueVotesByField: jest.fn(),
  getRankingRowForDay: jest.fn(),
  insertRankingRow: jest.fn(),
  updateRankingRow: jest.fn()
};

const mockVotesRepoConstructor = jest.fn(() => votesRepo);

jest.unstable_mockModule('../../src/repositories/votes.repository.js', () => ({
  default: mockVotesRepoConstructor
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  votesClient: {},
  publicServiceClient: {}
}));

const { default: votesService } = await import('../../src/services/votes.services.js');

describe('votes.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    votesRepo.getTrueVotesByField.mockResolvedValue([]);
    votesRepo.getRankingRowForDay.mockResolvedValue(null);
    votesRepo.insertRankingRow.mockResolvedValue({});
    votesRepo.updateRankingRow.mockResolvedValue({});
  });

  test('createVote toggles existing trip vote', async () => {
    votesRepo.getUserVoteByTripIdAndUserId.mockResolvedValue({ id: 8, value: true });
    votesRepo.updateVoteTrips.mockResolvedValue({ value: false });

    const result = await votesService.createVote(5, { tripid: 10 });

    expect(votesRepo.updateVoteTrips).toHaveBeenCalledWith(5, false, 10, 8);
    expect(votesRepo.getTrueVotesByField).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ value: false });
  });

  test('createVote creates trip vote when none exists', async () => {
    votesRepo.getUserVoteByTripIdAndUserId.mockResolvedValue(null);
    votesRepo.createVoteTrips.mockResolvedValue({});

    const result = await votesService.createVote(5, { tripid: 10 });

    expect(votesRepo.createVoteTrips).toHaveBeenCalledWith(5, { tripid: 10 });
    expect(votesRepo.getTrueVotesByField).toHaveBeenCalledTimes(3);
    expect(result).toEqual({});
  });

  test('createVote toggles itinerary vote', async () => {
    votesRepo.getUserVoteByItineraryTripIdPlaceIdAndUserId.mockResolvedValue({ value: false });
    votesRepo.updateVoteItinerary.mockResolvedValue({});

    await votesService.createVote(6, { tripid: 1, placeid: 2 });

    expect(votesRepo.updateVoteItinerary).toHaveBeenCalledWith(6, true, 1, 2);
    expect(votesRepo.getTrueVotesByField).toHaveBeenCalledTimes(3);
  });

  test('createVote creates place vote when none exists', async () => {
    votesRepo.getUserVoteByPlaceIdAndUserId.mockResolvedValue(null);
    votesRepo.createVotePlace.mockResolvedValue({});

    await votesService.createVote(7, { placeid: 99 });

    expect(votesRepo.createVotePlace).toHaveBeenCalledWith(7, { placeid: 99 });
    expect(votesRepo.getTrueVotesByField).toHaveBeenCalledTimes(3);
  });

  test('createVote throws badRequest for invalid payload', async () => {
    await expect(votesService.createVote(1, {})).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid vote data'
    });
  });

  test('getVotesByTrip returns summarized count', async () => {
    votesRepo.getVotesByTripId.mockResolvedValue([{}, {}, {}]);

    const result = await votesService.getVotesByTrip(9);

    expect(result).toEqual({ summary: 3 });
  });

  test('getVotesByPlace returns summarized count', async () => {
    votesRepo.getVotesByPlaceId.mockResolvedValue([{}, {}]);

    const result = await votesService.getVotesByPlace(9);

    expect(result).toEqual({ summary: 2 });
  });
});
