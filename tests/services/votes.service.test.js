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
  getVotesByPlaceId: jest.fn()
};

const mockVotesRepoConstructor = jest.fn(() => votesRepo);

jest.unstable_mockModule('../../src/repositories/votes.repository.js', () => ({
  default: mockVotesRepoConstructor
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  votesClient: {}
}));

const { default: votesService } = await import('../../src/services/votes.services.js');

describe('votes.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createVote toggles existing trip vote', async () => {
    votesRepo.getUserVoteByTripIdAndUserId.mockResolvedValue({ status: 200, data: { id: 8, value: true } });
    votesRepo.updateVoteTrips.mockResolvedValue({ status: 200, data: { value: false } });

    const result = await votesService.createVote(5, { tripid: 10 });

    expect(votesRepo.updateVoteTrips).toHaveBeenCalledWith(5, false, 10, 8);
    expect(result.status).toBe(200);
  });

  test('createVote creates trip vote when none exists', async () => {
    votesRepo.getUserVoteByTripIdAndUserId.mockResolvedValue({ status: 404 });
    votesRepo.createVoteTrips.mockResolvedValue({ status: 201, data: {} });

    const result = await votesService.createVote(5, { tripid: 10 });

    expect(votesRepo.createVoteTrips).toHaveBeenCalledWith(5, { tripid: 10 });
    expect(result.status).toBe(201);
  });

  test('createVote toggles itinerary vote', async () => {
    votesRepo.getUserVoteByItineraryTripIdPlaceIdAndUserId.mockResolvedValue({ status: 200, data: { value: false } });
    votesRepo.updateVoteItinerary.mockResolvedValue({ status: 200, data: {} });

    const result = await votesService.createVote(6, { tripid: 1, placeid: 2 });

    expect(votesRepo.updateVoteItinerary).toHaveBeenCalledWith(6, true, 1, 2);
    expect(result.status).toBe(200);
  });

  test('createVote creates place vote when none exists', async () => {
    votesRepo.getUserVoteByPlaceIdAndUserId.mockResolvedValue({ status: 404 });
    votesRepo.createVotePlace.mockResolvedValue({ status: 201, data: {} });

    const result = await votesService.createVote(7, { placeid: 99 });

    expect(votesRepo.createVotePlace).toHaveBeenCalledWith(7, { placeid: 99 });
    expect(result.status).toBe(201);
  });

  test('createVote returns 400 for invalid payload', async () => {
    const result = await votesService.createVote(1, {});

    expect(result).toEqual({ status: 400, error: 'Invalid vote data' });
  });

  test('getVotesByTrip returns summarized count', async () => {
    votesRepo.getVotesByTripId.mockResolvedValue({ status: 200, data: [{}, {}, {}] });

    const result = await votesService.getVotesByTrip(9);

    expect(result).toEqual({ status: 200, data: { summary: 3 } });
  });

  test('getVotesByPlace returns summarized count', async () => {
    votesRepo.getVotesByPlaceId.mockResolvedValue({ status: 200, data: [{}, {}] });

    const result = await votesService.getVotesByPlace(9);

    expect(result).toEqual({ status: 200, data: { summary: 2 } });
  });
});
