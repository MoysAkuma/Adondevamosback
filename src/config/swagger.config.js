// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi  from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Adondevamos.back API Documentation',
      version: '0.0.alpha',
      description: `API documentation Express backend that handles adondevamos.web project.
      
## How to use JWT Authentication:

1. **Login**: Call the \`/Login\` endpoint with your credentials
2. **Copy Token**: Copy the \`token\` value from the response
3. **Authorize**: Click the 🔒 **Authorize** button at the top right
4. **Enter Token**: Paste your token (just the token, without "Bearer")
5. **Test**: Now you can test protected endpoints like \`/check-auth\` and \`/Logout\`

The token will be automatically included in the Authorization header for all requests.`,
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
        url: 'https://adondevamosback.onrender.com/v1',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}". To get a token, use the /Login endpoint first.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            tag: {
              type: 'string',
              description: 'User tag/username'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            name: {
              type: 'string',
              description: 'First name'
            },
            lastname: {
              type: 'string',
              description: 'Last name'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login success'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT authentication token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            statusCode: {
              type: 'integer',
              example: 400
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints'
      }
    ],
    security: []
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