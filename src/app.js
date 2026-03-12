import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from'body-parser';
import cookieParser from 'cookie-parser';
import redisConfig from './config/redis.config.js';
import tripsRoutes from './routes/trips.routes.js';
import placesRoutes from './routes/places.routes.js';
import usersRoutes from './routes/users.routes.js';
import cataloguesRoutes from './routes/catalogues.routes.js';
import votesRoutes from './routes/votes.routes.js';
import rankingRoutes from './routes/ranking.routes.js';
import errorMiddleware from './middleware/error.middleware.js'
import authRoutes from './routes/auth.routes.js';
import { env } from './config/env.js';
dotenv.config();

const app = express();

// Swagger documentation
import swaggerConfig from './config/swagger.config.js';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      env.FRONT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ].filter(Boolean); // Remove undefined values
    
    // In development, allow all origins
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'user-id'],
  credentials: true
};

// Cors Set up
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

//swagger setup
swaggerConfig(app);

// Redis and session setup
redisConfig(app);

// Routes
app.use('/v1', tripsRoutes);
app.use('/v1', authRoutes);
app.use('/v1', placesRoutes);
app.use('/v1', usersRoutes);
app.use('/v1', cataloguesRoutes);
app.use('/v1', votesRoutes);
app.use('/v1/', rankingRoutes);

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

app.listen(env.PORT, '0.0.0.0', () => {
  console.log("Adondevamos.back is running at ", env.PORT);
  console.log(`Swagger docs available at http://localhost:${env.PORT}/api-docs`);
});