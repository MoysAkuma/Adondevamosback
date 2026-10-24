import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
};

const mockAuthenticate = jest.fn();

const mockTripsController = {
  getAllTrips: jest.fn(),
  getTripsByOwner: jest.fn(),
  getTripbyID: jest.fn(),
  createTrip: jest.fn(),
  updateTripbyID: jest.fn(),
  deleteTripbyID: jest.fn(),
  searchTrips: jest.fn(),
  createItinerary: jest.fn(),
  updateItinerary: jest.fn(),
  addItineraryPlace: jest.fn(),
  createMemberList: jest.fn(),
  updateMemberList: jest.fn(),
  getNewTrips: jest.fn(),
  uploadImages: jest.fn(),
  updateImagesMetadata: jest.fn(),
  deleteImage: jest.fn(),
  setCoverImage: jest.fn()
};

jest.unstable_mockModule('express', () => ({
  default: {
    Router: () => mockRouter
  }
}));

jest.unstable_mockModule('../../src/middleware/auth.middleware.js', () => ({
  authenticate: mockAuthenticate
}));

jest.unstable_mockModule('../../src/controllers/trips.controller.js', () => ({
  default: mockTripsController
}));

const { default: router } = await import('../../src/routes/trips.routes.js');

describe('trips.routes', () => {
  test('exports express router instance', () => {
    expect(router).toBe(mockRouter);
  });

  test('registers GET endpoints', () => {
    expect(mockRouter.get).toHaveBeenCalledWith('/Trips', mockTripsController.getAllTrips);
    expect(mockRouter.get).toHaveBeenCalledWith('/Trips/owner/:UserId', mockTripsController.getTripsByOwner);
    expect(mockRouter.get).toHaveBeenCalledWith('/Trips/:TripID', mockTripsController.getTripbyID);
    expect(mockRouter.get).toHaveBeenCalledWith('/Trips/lasted/:Limit?', mockTripsController.getNewTrips);
  });

  test('registers POST endpoints', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Trips', mockAuthenticate, mockTripsController.createTrip);
    expect(mockRouter.post).toHaveBeenCalledWith('/Trips/Search', mockTripsController.searchTrips);
    expect(mockRouter.post).toHaveBeenCalledWith('/Trips/:TripID/Itinerary', mockAuthenticate, mockTripsController.createItinerary);
    expect(mockRouter.post).toHaveBeenCalledWith('/Trips/:TripID/Members', mockAuthenticate, mockTripsController.createMemberList);
    expect(mockRouter.post).toHaveBeenCalledWith('/Trips/:TripID/Images', mockAuthenticate, mockTripsController.uploadImages);
  });

  test('registers PUT endpoints', () => {
    expect(mockRouter.put).toHaveBeenCalledWith('/Trips/:TripID', mockAuthenticate, mockTripsController.updateTripbyID);
    expect(mockRouter.put).toHaveBeenCalledWith('/Trips/:TripID/Itinerary', mockAuthenticate, mockTripsController.updateItinerary);
    expect(mockRouter.put).toHaveBeenCalledWith('/Trips/:TripID/Members', mockAuthenticate, mockTripsController.updateMemberList);
    expect(mockRouter.put).toHaveBeenCalledWith('/Trips/:TripID/Images', mockAuthenticate, mockTripsController.updateImagesMetadata);
    expect(mockRouter.put).toHaveBeenCalledWith('/Trips/:TripID/Images/:ImageID/SetCover', mockAuthenticate, mockTripsController.setCoverImage);
  });

  test('registers PATCH and DELETE endpoints', () => {
    expect(mockRouter.patch).toHaveBeenCalledWith('/Trips/:TripID/Itinerary', mockAuthenticate, mockTripsController.addItineraryPlace);
    expect(mockRouter.delete).toHaveBeenCalledWith('/Trips/:TripID', mockAuthenticate, mockTripsController.deleteTripbyID);
    expect(mockRouter.delete).toHaveBeenCalledWith('/Trips/:TripID/Images/:ImageID', mockAuthenticate, mockTripsController.deleteImage);
  });
});