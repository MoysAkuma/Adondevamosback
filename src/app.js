import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from'body-parser';
import cookieParser from 'cookie-parser';
import redisConfig from './configs/redis.config.js';
import tripsRoutes from './routes/trips.routes.js';
import placesRoutes from './routes/places.routes.js';
import usersRoutes from './routes/users.routes.js';
import errorMiddleware from './middleware/error.middleware.js'
import login from './routes/login.routes.js';
import { env } from './config/env.js';
dotenv.config();

const app = express();

// Swagger documentation
import swaggerConfig from './configs/swagger.config.js';

const corsOptions = {
  origin : (origin, callback) => { 
    if(!origin || origin === env.FRONT_URL ) return callback(null, true);
    return callback( new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Request-With'],
  credentials: true
};

// Cors Set up
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Set trust proxy BEFORE session middleware
app.set('trust proxy', 1);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

//swagger setup
swaggerConfig(app);

// Redis and session setup
redisConfig(app);

// Routes
app.use('/v1', tripsRoutes);
app.use('/v1', login);
app.use('/v1', placesRoutes);
app.use('/v1', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected',
    cache: 'Connected'
  });
});

// Error handling
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handleError);

app.listen(3001, '0.0.0.0', () => {
  console.log("Adondevamos.back is running at ", 3001);
  console.log(`Swagger docs available at http://localhost:3001/api-docs`);
});