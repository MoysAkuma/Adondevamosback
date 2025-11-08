import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient as createRedisClient } from 'redis';

import tripsRoutes from './routes/trips.routes.js';
import errorMiddleware from './middleware/error.middleware.js'
import countriesRoutes from './routes/countries.routes.js';
import bodyParser from'body-parser';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middleware
app.use(cors());


app.use(cors({
  origin: process.env.FRONT_URL, 
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Redis client setup for session store
let redisClient;
let redisStore;
if (process.env.REDIS_HOST && process.env.REDIS_PORT && process.env.REDIS_PASSWORD) {
  redisClient = createRedisClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT)
    },
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    legacyMode: true // for connect-redis compatibility
  });
  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('error', err => console.error('Redis error:', err));
  redisClient.connect().catch(console.error);
  redisStore = new RedisStore({ client: redisClient });
  if (redisStore) console.log('RedisStore initialized');
  else console.log('RedisStore not initialized');
}

// Set trust proxy BEFORE session middleware
app.set('trust proxy', 1);

//session config
app.use(session({
    name:'sessionId',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: redisStore || undefined,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        // domain property removed for testing
    }
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/v1', countriesRoutes);
app.use('/v1', tripsRoutes);

// Error handling
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handleError);

app.listen(3001, '0.0.0.0', () => {
  console.log("Adondevamos.back is running at ", 3001);
});