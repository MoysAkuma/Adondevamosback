// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi  from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Adondevamos API Documentation',
      version: '0.0.alpha',
      description: 'API documentation for your Express application that handles adondevamos.web project.',
      contact: {
        name: 'Creator',
        email: 'moises.moran.dev@gmail.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/v1', // Local development URL
        description: 'Development server',
      },
      {
        url: 'https://adondevamosback.onrender.com',
        description: 'Production server',
      }
    ],
    components: {
     
    },
    security: [{
    }]
  },
  apis: ['./src/routes/*.js', './src/models/**/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default (app) => {
  app.use('/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "AdondeVamos API Docs"
    }));
};