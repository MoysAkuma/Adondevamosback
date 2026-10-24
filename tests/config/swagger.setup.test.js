import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const mockSwaggerConfig = jest.fn();

jest.unstable_mockModule('../../src/config/swagger.config.js', () => ({
  default: mockSwaggerConfig
}));

const { default: setupSwagger } = await import('../../src/config/swagger.setup.js');

describe('swagger.setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('delegates app registration to swagger.config', () => {
    const app = { use: jest.fn() };

    setupSwagger(app);

    expect(mockSwaggerConfig).toHaveBeenCalledTimes(1);
    expect(mockSwaggerConfig).toHaveBeenCalledWith(app);
  });
});