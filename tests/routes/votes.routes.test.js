import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn(),
  post: jest.fn()
};

const mockAuthenticate = jest.fn();

const mockVotesController = {
  getVotesByPlace: jest.fn(),
  getVotesByTrip: jest.fn(),
  createVote: jest.fn()
};

jest.unstable_mockModule('express', () => ({
  default: {
    Router: () => mockRouter
  }
}));

jest.unstable_mockModule('../../src/controllers/votes.controller.js', () => ({
  default: mockVotesController
}));

jest.unstable_mockModule('../../src/middleware/auth.middleware.js', () => ({
  authenticate: mockAuthenticate
}));

const { default: router } = await import('../../src/routes/votes.routes.js');

describe('votes.routes', () => {
  test('exports express router instance', () => {
    expect(router).toBe(mockRouter);
  });

  test('registers public GET routes', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/Votes/Place/:placeId', mockVotesController.getVotesByPlace);
    expect(mockRouter.get).toHaveBeenCalledWith('/Votes/Trip/:tripId', mockVotesController.getVotesByTrip);
  });

  test('registers protected POST route with authenticate middleware', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Votes/:userid', mockAuthenticate, mockVotesController.createVote);
  });
});