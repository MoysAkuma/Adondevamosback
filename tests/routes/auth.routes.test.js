import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn(),
  post: jest.fn()
};

const mockAuthenticate = jest.fn();

const mockAuthController = {
  login: jest.fn(),
  checkAuth: jest.fn(),
  logout: jest.fn()
};

jest.unstable_mockModule('express', () => ({
  default: {
    Router: () => mockRouter
  }
}));

jest.unstable_mockModule('../../src/middleware/auth.middleware.js', () => ({
  authenticate: mockAuthenticate
}));

jest.unstable_mockModule('../../src/controllers/auth.controller.js', () => ({
  default: mockAuthController
}));

const { default: router } = await import('../../src/routes/auth.routes.js');

describe('auth.routes', () => {
  test('exports express router instance', () => {
    expect(router).toBe(mockRouter);
  });

  test('registers login route without auth middleware', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Login', mockAuthController.login);
  });

  test('registers check-auth route with authenticate middleware', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/check-auth', mockAuthenticate, mockAuthController.checkAuth);
  });

  test('registers logout route with authenticate middleware', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Logout', mockAuthenticate, mockAuthController.logout);
  });
});