import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn()
};

const mockRankingController = {
  getValidEntityTypes: jest.fn(),
  getTopVoted: jest.fn()
};

const mockRouterFactory = jest.fn(() => mockRouter);

jest.unstable_mockModule('express', () => ({
  Router: mockRouterFactory
}));

jest.unstable_mockModule('../../src/controllers/ranking.controller.js', () => ({
  default: mockRankingController
}));

const { default: router } = await import('../../src/routes/ranking.routes.js');

describe('ranking.routes', () => {
  test('creates and exports router instance', () => {
    expect(mockRouterFactory).toHaveBeenCalledTimes(1);
    expect(router).toBe(mockRouter);
  });

  test('registers ranking routes with expected handlers', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/ranking/types', mockRankingController.getValidEntityTypes);
    expect(mockRouter.get).toHaveBeenCalledWith('/ranking/:entityType', mockRankingController.getTopVoted);
  });
});