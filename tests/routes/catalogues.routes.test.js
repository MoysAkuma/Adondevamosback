import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn()
};

const mockAuthorizeAdmin = jest.fn();
const mockAuthenticate = jest.fn();

const mockCataloguesController = {
  getAllCatalogues: jest.fn(),
  getAllCountries: jest.fn(),
  getAllStates: jest.fn(),
  getAllCities: jest.fn(),
  getAllFacilities: jest.fn(),
  createCatalogueOption: jest.fn(),
  updateCatalogueOption: jest.fn()
};

jest.unstable_mockModule('express', () => ({
  default: {
    Router: () => mockRouter
  }
}));

jest.unstable_mockModule('../../src/controllers/catalogues.controller.js', () => ({
  default: mockCataloguesController
}));

jest.unstable_mockModule('../../src/middleware/auth.middleware.js', () => ({
  authenticate: mockAuthenticate,
  authorizeAdmin: mockAuthorizeAdmin
}));

const { default: router } = await import('../../src/routes/catalogues.routes.js');

describe('catalogues.routes', () => {
  test('exports express router instance', () => {
    expect(router).toBe(mockRouter);
  });

  test('registers public GET routes', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/Catalogues/all', mockCataloguesController.getAllCatalogues);
    expect(mockRouter.get).toHaveBeenCalledWith('/Catalogues/countries', mockCataloguesController.getAllCountries);
    expect(mockRouter.get).toHaveBeenCalledWith('/Catalogues/states', mockCataloguesController.getAllStates);
    expect(mockRouter.get).toHaveBeenCalledWith('/Catalogues/cities', mockCataloguesController.getAllCities);
    expect(mockRouter.get).toHaveBeenCalledWith('/Catalogues/facilities', mockCataloguesController.getAllFacilities);
  });

  test('registers admin-protected mutation routes', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Catalogues/:option', mockAuthorizeAdmin, mockCataloguesController.createCatalogueOption);
    expect(mockRouter.patch).toHaveBeenCalledWith('/Catalogues/:option/:id', mockAuthorizeAdmin, mockCataloguesController.updateCatalogueOption);
  });
});