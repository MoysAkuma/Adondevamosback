import placesController from '../../src/controllers/places.controller.js';
import placesService from '../../src/services/places.service.js';
import { PlaceModel } from '../../src/models/place.model.js';

describe('places.controller createPlace', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns 201 with info.id when create is successful', async () => {
    const validatedPayload = {
      name: 'Place Name',
      countryid: 1,
      stateid: 1,
      cityid: 1,
      description: 'Description',
      address: 'Address',
      ispublic: false,
      latitude: 24.8,
      longitude: -107.3
    };

    req.body = { ...validatedPayload };

    jest.spyOn(PlaceModel, 'forCreate').mockReturnValue(validatedPayload);
    jest.spyOn(placesService, 'createPlace').mockResolvedValue({ status: 201, data: { id: 10 } });

    await placesController.createPlace(req, res, next);

    expect(PlaceModel.forCreate).toHaveBeenCalledWith(req.body);
    expect(placesService.createPlace).toHaveBeenCalledWith(validatedPayload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Place created successfully',
      info: { id: 10 }
    });
    expect(res.send).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next with 400 when payload validation fails', async () => {
    jest.spyOn(PlaceModel, 'forCreate').mockImplementation(() => {
      throw new Error("Field 'name' is required");
    });

    const createSpy = jest.spyOn(placesService, 'createPlace');

    await placesController.createPlace(req, res, next);

    expect(createSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);

    const [error] = next.mock.calls[0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Field 'name' is required");
  });

  test('calls next with service error when repository create fails', async () => {
    const validatedPayload = {
      name: 'Place Name',
      countryid: 1,
      stateid: 1,
      cityid: 1,
      description: 'Description',
      address: 'Address',
      ispublic: false,
      latitude: 24.8,
      longitude: -107.3
    };

    jest.spyOn(PlaceModel, 'forCreate').mockReturnValue(validatedPayload);
    jest.spyOn(placesService, 'createPlace').mockResolvedValue({ status: 500, error: 'Place creation failed' });

    await placesController.createPlace(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const [error] = next.mock.calls[0];
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Place creation failed');
  });
});
