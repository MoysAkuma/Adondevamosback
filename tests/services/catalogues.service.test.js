import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const repoMethods = {
  getAllCountries: jest.fn(),
  getAllStates: jest.fn(),
  getAllCities: jest.fn(),
  getAllFacilities: jest.fn(),
  updateCountryField: jest.fn(),
  updateStateField: jest.fn(),
  updateCityField: jest.fn(),
  updateFacilityField: jest.fn(),
  createCountry: jest.fn(),
  createState: jest.fn(),
  createCity: jest.fn(),
  createFacility: jest.fn()
};

const mockCatalogueRepoConstructor = jest.fn(() => repoMethods);

const mockValidateOption = jest.fn();
const mockValidateId = jest.fn();
const mockForUpdate = jest.fn();
const mockForCreate = jest.fn();

jest.unstable_mockModule('../../src/repositories/catalogues.repository.js', () => ({
  default: mockCatalogueRepoConstructor
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  cataloguesClient: {}
}));

jest.unstable_mockModule('../../src/models/catalogue-option.model.js', () => ({
  CatalogueOptionModel: {
    validateOption: mockValidateOption,
    validateId: mockValidateId,
    forUpdate: mockForUpdate,
    forCreate: mockForCreate
  }
}));

const { default: cataloguesService } = await import('../../src/services/catalogues.service.js');

describe('catalogues.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllCatalogues returns aggregated data when all repository calls succeed', async () => {
    repoMethods.getAllCountries.mockResolvedValue({ status: 200, data: [{ id: 1, name: 'CR' }] });
    repoMethods.getAllStates.mockResolvedValue({ status: 200, data: [{ id: 10, name: 'SJ' }] });
    repoMethods.getAllCities.mockResolvedValue({ status: 200, data: [{ id: 100, name: 'Escazu' }] });
    repoMethods.getAllFacilities.mockResolvedValue({ status: 200, data: [{ id: 1000, name: 'Parking' }] });

    const result = await cataloguesService.getAllCatalogues();

    expect(result).toEqual({
      status: 200,
      data: {
        countries: [{ id: 1, name: 'CR' }],
        states: [{ id: 10, name: 'SJ' }],
        cities: [{ id: 100, name: 'Escazu' }],
        facilities: [{ id: 1000, name: 'Parking' }]
      }
    });
  });

  test('getAllCatalogues returns countries error immediately', async () => {
    repoMethods.getAllCountries.mockResolvedValue({ status: 500, error: 'countries failed' });

    const result = await cataloguesService.getAllCatalogues();

    expect(result).toEqual({ status: 500, error: 'countries failed' });
    expect(repoMethods.getAllStates).not.toHaveBeenCalled();
    expect(repoMethods.getAllCities).not.toHaveBeenCalled();
    expect(repoMethods.getAllFacilities).not.toHaveBeenCalled();
  });

  test('getAllCatalogues returns states error and does not continue', async () => {
    repoMethods.getAllCountries.mockResolvedValue({ status: 200, data: [] });
    repoMethods.getAllStates.mockResolvedValue({ status: 500, error: 'states failed' });

    const result = await cataloguesService.getAllCatalogues();

    expect(result).toEqual({ status: 500, error: 'states failed' });
    expect(repoMethods.getAllCities).not.toHaveBeenCalled();
    expect(repoMethods.getAllFacilities).not.toHaveBeenCalled();
  });

  test('getAllCountries delegates to repository', async () => {
    repoMethods.getAllCountries.mockResolvedValue({ status: 200, data: [{ id: 1 }] });

    const result = await cataloguesService.getAllCountries();

    expect(repoMethods.getAllCountries).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 200, data: [{ id: 1 }] });
  });

  test('getAllStates delegates to repository', async () => {
    repoMethods.getAllStates.mockResolvedValue({ status: 200, data: [{ id: 1 }] });

    const result = await cataloguesService.getAllStates();

    expect(repoMethods.getAllStates).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 200, data: [{ id: 1 }] });
  });

  test('getAllCities delegates to repository', async () => {
    repoMethods.getAllCities.mockResolvedValue({ status: 200, data: [{ id: 1 }] });

    const result = await cataloguesService.getAllCities();

    expect(repoMethods.getAllCities).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 200, data: [{ id: 1 }] });
  });

  test('getAllFacilities delegates to repository', async () => {
    repoMethods.getAllFacilities.mockResolvedValue({ status: 200, data: [{ id: 1 }] });

    const result = await cataloguesService.getAllFacilities();

    expect(repoMethods.getAllFacilities).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 200, data: [{ id: 1 }] });
  });

  test('updateCatalogueOption validates input and routes to repository update method', async () => {
    mockValidateId.mockReturnValue(12);
    mockForUpdate.mockReturnValue({ name: 'Costa Rica', hide: false });
    mockValidateOption.mockReturnValue('country');
    repoMethods.updateCountryField.mockResolvedValue({ status: 200, data: 'Country updated successfully' });

    const result = await cataloguesService.updateCatalogueOption('country', '12', { name: 'Costa Rica', hide: false });

    expect(mockValidateId).toHaveBeenCalledWith('12');
    expect(mockForUpdate).toHaveBeenCalledWith('country', { name: 'Costa Rica', hide: false });
    expect(mockValidateOption).toHaveBeenCalledWith('country');
    expect(repoMethods.updateCountryField).toHaveBeenCalledWith({ name: 'Costa Rica', hide: false }, 12);
    expect(result).toEqual({ status: 200, data: 'Country updated successfully' });
  });

  test('updateCatalogueOption returns 400 when validation fails', async () => {
    mockValidateId.mockImplementation(() => {
      throw new Error('Invalid ID');
    });

    const result = await cataloguesService.updateCatalogueOption('country', 'bad-id', { name: 'X' });

    expect(result).toEqual({ status: 400, error: 'Invalid ID' });
  });

  test('updateCatalogueOption routes to facility update', async () => {
    mockValidateId.mockReturnValue(8);
    mockForUpdate.mockReturnValue({ name: 'WiFi' });
    mockValidateOption.mockReturnValue('facility');
    repoMethods.updateFacilityField.mockResolvedValue({ status: 200, data: 'Facility updated successfully' });

    const result = await cataloguesService.updateCatalogueOption('facility', 8, { name: 'WiFi' });

    expect(repoMethods.updateFacilityField).toHaveBeenCalledWith({ name: 'WiFi' }, 8);
    expect(result.status).toBe(200);
  });

  test('createCatalogueOption validates input and routes to create method', async () => {
    mockForCreate.mockReturnValue({ name: 'Heredia', countryid: 1 });
    mockValidateOption.mockReturnValue('state');
    repoMethods.createState.mockResolvedValue({
      status: 201,
      data: [{ id: 50, name: 'Heredia', countryid: 1 }]
    });

    const result = await cataloguesService.createCatalogueOption('state', { name: 'Heredia', countryid: 1 });

    expect(mockForCreate).toHaveBeenCalledWith('state', { name: 'Heredia', countryid: 1 });
    expect(mockValidateOption).toHaveBeenCalledWith('state');
    expect(repoMethods.createState).toHaveBeenCalledWith({ name: 'Heredia', countryid: 1 });
    expect(result.status).toBe(201);
  });

  test('createCatalogueOption returns 400 when validation fails', async () => {
    mockForCreate.mockImplementation(() => {
      throw new Error('Request body must be an object');
    });

    const result = await cataloguesService.createCatalogueOption('city', null);

    expect(result).toEqual({ status: 400, error: 'Request body must be an object' });
  });
});
