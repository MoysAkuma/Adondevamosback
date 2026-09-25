import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import swaggerOptions from '../../src/config/swagger.options.js';

const docsDir = path.resolve(process.cwd(), 'src/docs/swagger');

const getSwaggerDocFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nestedFiles = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => getSwaggerDocFiles(path.join(dir, entry.name)));
  const currentFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => path.join(dir, entry.name));

  return [...currentFiles, ...nestedFiles];
};

describe('swagger.options', () => {
  test('exposes OpenAPI definition metadata', () => {
    expect(swaggerOptions).toEqual(
      expect.objectContaining({
        definition: expect.objectContaining({
          openapi: '3.0.0',
          info: expect.objectContaining({
            title: 'Adondevamos.back API Documentation',
            version: '0.0.alpha'
          })
        })
      })
    );
  });

  test('includes docs scan paths for routes and models', () => {
    expect(swaggerOptions.apis).toContain('./src/routes/*.js');
    expect(swaggerOptions.apis).toContain('./src/models/**/*.js');
    expect(swaggerOptions.apis).toContain('./src/docs/swagger/**/*.js');
  });

  test('contains bearer auth scheme configuration', () => {
    expect(swaggerOptions.definition.components.securitySchemes.bearerAuth).toEqual(
      expect.objectContaining({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      })
    );
  });

  test('all centralized swagger docs include at least one @swagger annotation', () => {
    expect(fs.existsSync(docsDir)).toBe(true);

    const swaggerDocFiles = getSwaggerDocFiles(docsDir);
    expect(swaggerDocFiles.length).toBeGreaterThan(0);

    swaggerDocFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('@swagger');
    });
  });
});