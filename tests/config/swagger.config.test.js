import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const mockSwaggerJsdoc = jest.fn();
const mockSetup = jest.fn();
const mockUse = jest.fn();
const mockSwaggerMiddleware = jest.fn();

jest.unstable_mockModule('swagger-jsdoc', () => ({
  default: mockSwaggerJsdoc
}));

jest.unstable_mockModule('swagger-ui-express', () => ({
  default: {
    serve: 'swagger-serve-middleware',
    setup: mockSetup
  }
}));

const { default: swaggerConfig } = await import('../../src/config/swagger.config.js');
const { default: swaggerOptions } = await import('../../src/config/swagger.options.js');

describe('swagger.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSwaggerJsdoc.mockReturnValue({ openapi: '3.0.0' });
    mockSetup.mockReturnValue(mockSwaggerMiddleware);
  });

  test('builds swagger specs using external swagger options', () => {
    swaggerConfig({ use: mockUse });

    expect(mockSwaggerJsdoc).toHaveBeenCalledWith(swaggerOptions);
  });

  test('registers /api-docs with swagger middleware and setup options', () => {
    swaggerConfig({ use: mockUse });

    expect(mockSetup).toHaveBeenCalledWith(
      { openapi: '3.0.0' },
      expect.objectContaining({
        explorer: true,
        customSiteTitle: 'AdondeVamos API Docs',
        swaggerOptions: expect.objectContaining({
          persistAuthorization: true,
          tryItOutEnabled: true,
          displayRequestDuration: true
        })
      })
    );

    expect(mockUse).toHaveBeenCalledWith('/api-docs', 'swagger-serve-middleware', mockSwaggerMiddleware);
  });
});