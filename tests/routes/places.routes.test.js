import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

const mockController = {
  getPlaceByID: jest.fn(),
  searchPlaces: jest.fn(),
  searchPlacesByField: jest.fn(),
  uploadImages: jest.fn(),
  createPlace: jest.fn(),
  updatePlace: jest.fn(),
  updateFacilities: jest.fn(),
  addFacilities: jest.fn(),
  getNewPlaces: jest.fn(),
  deleteImage: jest.fn(),
  setCoverImage: jest.fn()
};

const mockAuthenticate = jest.fn();
const mockAuthorizeAdmin = jest.fn();

jest.unstable_mockModule('express', () => ({
  default: {
    Router: () => mockRouter
  }
}));

jest.unstable_mockModule('../../src/controllers/places.controller.js', () => ({
  default: mockController
}));

jest.unstable_mockModule('../../src/middleware/auth.middleware.js', () => ({
  authenticate: mockAuthenticate,
  authorizeAdmin: mockAuthorizeAdmin
}));

const { default: router } = await import('../../src/routes/places.routes.js');

describe('places.routes', () => {
  test('exports express router instance', () => {
    expect(router).toBe(mockRouter);
  });

  test('registers GET endpoints with expected handlers', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/Places/:PlaceID', mockController.getPlaceByID);
    expect(mockRouter.get).toHaveBeenCalledWith('/Places/Search/:field/:name', mockController.searchPlacesByField);
    expect(mockRouter.get).toHaveBeenCalledWith('/Places/lasted/:limit?', mockController.getNewPlaces);
  });

  test('registers POST endpoints with expected middleware chain', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Places/Search', mockController.searchPlaces);
    expect(mockRouter.post).toHaveBeenCalledWith('/Places/:PlaceID/Images', mockAuthenticate, mockController.uploadImages);
    expect(mockRouter.post).toHaveBeenCalledWith('/Places', mockAuthenticate, mockController.createPlace);
    expect(mockRouter.post).toHaveBeenCalledWith('/Places/:PlaceID/Facilities', mockAuthenticate, mockController.addFacilities);
  });

  test('registers PUT endpoints with expected middleware chain', () => {
    expect(mockRouter.put).toHaveBeenCalledWith('/Places/:PlaceID', mockAuthorizeAdmin, mockController.updatePlace);
    expect(mockRouter.put).toHaveBeenCalledWith('/Places/:PlaceID/Facilities', mockAuthenticate, mockController.updateFacilities);
    expect(mockRouter.put).toHaveBeenCalledWith('/Places/:PlaceID/Images/:ImageID/SetCover', mockAuthorizeAdmin, mockController.setCoverImage);
  });

  test('registers DELETE endpoint with expected middleware chain', () => {
    expect(mockRouter.delete).toHaveBeenCalledWith('/Places/:PlaceID/Images/:ImageID', mockAuthorizeAdmin, mockController.deleteImage);
  });
});