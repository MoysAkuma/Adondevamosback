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
    repoMethods.getAllCountries.mockResolvedValue([{ id: 1, name: 'CR' }]);
    repoMethods.getAllStates.mockResolvedValue([{ id: 10, name: 'SJ' }]);
    repoMethods.getAllCities.mockResolvedValue([{ id: 100, name: 'Escazu' }]);
    repoMethods.getAllFacilities.mockResolvedValue([{ id: 1000, name: 'Parking' }]);

    const result = await cataloguesService.getAllCatalogues();

    expect(result).toEqual({
      countries: [{ id: 1, name: 'CR' }],
      states: [{ id: 10, name: 'SJ' }],
      cities: [{ id: 100, name: 'Escazu' }],
      facilities: [{ id: 1000, name: 'Parking' }]
    });
  });

  test('getAllCatalogues propagates countries error and does not continue', async () => {
    repoMethods.getAllCountries.mockRejectedValue(new Error('countries failed'));

    await expect(cataloguesService.getAllCatalogues()).rejects.toThrow('countries failed');
    expect(repoMethods.getAllStates).not.toHaveBeenCalled();
    expect(repoMethods.getAllCities).not.toHaveBeenCalled();
    expect(repoMethods.getAllFacilities).not.toHaveBeenCalled();
  });

  test('getAllCatalogues propagates states error and does not continue', async () => {
    repoMethods.getAllCountries.mockResolvedValue([]);
    repoMethods.getAllStates.mockRejectedValue(new Error('states failed'));

    await expect(cataloguesService.getAllCatalogues()).rejects.toThrow('states failed');
    expect(repoMethods.getAllCities).not.toHaveBeenCalled();
    expect(repoMethods.getAllFacilities).not.toHaveBeenCalled();
  });

  test('getAllCountries delegates to repository', async () => {
    repoMethods.getAllCountries.mockResolvedValue([{ id: 1 }]);

    const result = await cataloguesService.getAllCountries();

    expect(repoMethods.getAllCountries).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  test('getAllStates delegates to repository', async () => {
    repoMethods.getAllStates.mockResolvedValue([{ id: 1 }]);

    const result = await cataloguesService.getAllStates();

    expect(repoMethods.getAllStates).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  test('getAllCities delegates to repository', async () => {
    repoMethods.getAllCities.mockResolvedValue([{ id: 1 }]);

    const result = await cataloguesService.getAllCities();

    expect(repoMethods.getAllCities).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  test('getAllFacilities delegates to repository', async () => {
    repoMethods.getAllFacilities.mockResolvedValue([{ id: 1 }]);

    const result = await cataloguesService.getAllFacilities();

    expect(repoMethods.getAllFacilities).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  test('updateCatalogueOption validates input and routes to repository update method', async () => {
    mockValidateId.mockReturnValue(12);
    mockForUpdate.mockReturnValue({ name: 'Costa Rica', hide: false });
    mockValidateOption.mockReturnValue('country');
    repoMethods.updateCountryField.mockResolvedValue(undefined);

    await cataloguesService.updateCatalogueOption('country', '12', { name: 'Costa Rica', hide: false });

    expect(mockValidateId).toHaveBeenCalledWith('12');
    expect(mockForUpdate).toHaveBeenCalledWith('country', { name: 'Costa Rica', hide: false });
    expect(mockValidateOption).toHaveBeenCalledWith('country');
    expect(repoMethods.updateCountryField).toHaveBeenCalledWith({ name: 'Costa Rica', hide: false }, 12);
  });

  test('updateCatalogueOption throws badRequest when validation fails', async () => {
    mockValidateId.mockImplementation(() => {
      throw new Error('Invalid ID');
    });

    await expect(cataloguesService.updateCatalogueOption('country', 'bad-id', { name: 'X' })).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid ID'
    });
  });

  test('updateCatalogueOption routes to facility update', async () => {
    mockValidateId.mockReturnValue(8);
    mockForUpdate.mockReturnValue({ name: 'WiFi' });
    mockValidateOption.mockReturnValue('facility');
    repoMethods.updateFacilityField.mockResolvedValue(undefined);

    await cataloguesService.updateCatalogueOption('facility', 8, { name: 'WiFi' });

    expect(repoMethods.updateFacilityField).toHaveBeenCalledWith({ name: 'WiFi' }, 8);
  });

  test('createCatalogueOption validates input and routes to create method', async () => {
    mockForCreate.mockReturnValue({ name: 'Heredia', countryid: 1 });
    mockValidateOption.mockReturnValue('state');
    repoMethods.createState.mockResolvedValue([{ id: 50, name: 'Heredia', countryid: 1 }]);

    const result = await cataloguesService.createCatalogueOption('state', { name: 'Heredia', countryid: 1 });

    expect(mockForCreate).toHaveBeenCalledWith('state', { name: 'Heredia', countryid: 1 });
    expect(mockValidateOption).toHaveBeenCalledWith('state');
    expect(repoMethods.createState).toHaveBeenCalledWith({ name: 'Heredia', countryid: 1 });
    expect(result).toEqual([{ id: 50, name: 'Heredia', countryid: 1 }]);
  });

  test('createCatalogueOption throws badRequest when validation fails', async () => {
    mockForCreate.mockImplementation(() => {
      throw new Error('Request body must be an object');
    });

    await expect(cataloguesService.createCatalogueOption('city', null)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Request body must be an object'
    });
  });
});
