import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const orderResponses = {
  countries: { data: [], error: null }
};

const inResponses = {
  countries: { data: [], error: null },
  states: { data: [], error: null },
  cities: { data: [], error: null }
};

const fromMock = jest.fn((table) => ({
  select: jest.fn(() => ({
    order: jest.fn(() => Promise.resolve(orderResponses[table] || { data: [], error: null })),
    in: jest.fn(() => Promise.resolve(inResponses[table] || { data: [], error: null }))
  }))
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  cataloguesClient: {
    from: fromMock
  }
}));

const { default: ubicationService } = await import('../../src/services/ubication.service.js');

describe('ubication.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    orderResponses.countries = { data: [], error: null };
    inResponses.countries = { data: [], error: null };
    inResponses.states = { data: [], error: null };
    inResponses.cities = { data: [], error: null };
  });

  test('getCountries returns data when query succeeds', async () => {
    orderResponses.countries = {
      data: [{ id: 1, name: 'Costa Rica', code: 'CR', flagurl: 'x' }],
      error: null
    };

    const result = await ubicationService.getCountries();

    expect(result[0].name).toBe('Costa Rica');
  });

  test('getCountries throws internal when query fails', async () => {
    orderResponses.countries = {
      data: null,
      error: { message: 'db error' }
    };

    await expect(ubicationService.getCountries()).rejects.toMatchObject({
      statusCode: 500,
      message: 'db error'
    });
  });

  test('getUbicationNamesByIDs returns all grouped names', async () => {
    inResponses.countries = { data: [{ id: 1, name: 'CR', acronym: 'CR' }], error: null };
    inResponses.states = { data: [{ id: 2, name: 'SJ' }], error: null };
    inResponses.cities = { data: [{ id: 3, name: 'Escazu' }], error: null };

    const places = [{ countryid: 1, stateid: 2, cityid: 3 }, { countryid: 1, stateid: 2, cityid: 3 }];
    const result = await ubicationService.getUbicationNamesByIDs(places);

    expect(result.countries.length).toBe(1);
    expect(result.states.length).toBe(1);
    expect(result.cities.length).toBe(1);
  });

  test('getUbicationNamesByIDs throws internal when countries query fails', async () => {
    inResponses.countries = { data: null, error: { message: 'countries failed' } };

    await expect(
      ubicationService.getUbicationNamesByIDs([{ countryid: 1, stateid: 2, cityid: 3 }])
    ).rejects.toMatchObject({ statusCode: 500, message: 'countries failed' });
  });
});
