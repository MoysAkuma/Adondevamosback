import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import redisConfig from './configs/redis.config.js';

import tripsRoutes from './routes/trips.routes.js';
import errorMiddleware from './middleware/error.middleware.js'
import countriesRoutes from './routes/countries.routes.js';
import bodyParser from'body-parser';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
dotenv.config();

const app = express();

// Swagger documentation
import swaggerConfig from './configs/swagger.config.js';

// Middleware
app.use(cors());


app.use(cors({
  origin: env.FRONT_URL,
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


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
app.use('/v1', countriesRoutes);
app.use('/v1', tripsRoutes);

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