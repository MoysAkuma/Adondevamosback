// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi  from 'swagger-ui-express';
import swaggerOptions from './swagger.options.js';

export default (app) => {
  const specs = swaggerJsdoc(swaggerOptions);

  app.use('/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "AdondeVamos API Docs",
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          filter: true,
          syntaxHighlight: {
            activate: true,
            theme: "monokai"
          }
        }
    }));
};