
import { RedisStore } from 'connect-redis';
import { createClient as createRedisClient } from 'redis';
import session from 'express-session';
import { env as dotenv } from './env.js';
// Redis client setup for session store
let redisClient;
let redisStore;
if (dotenv.REDIS_HOST && dotenv.REDIS_PORT && dotenv.REDIS_PASSWORD) {
  redisClient = createRedisClient({
    socket: {
      host: dotenv.REDIS_HOST,
      port: Number(dotenv.REDIS_PORT)
    },
    username: dotenv.REDIS_USERNAME || 'default',
    password: dotenv.REDIS_PASSWORD,
    legacyMode: true // for connect-redis compatibility
  });
  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('error', err => console.error('Redis error:', err));
  redisClient.connect().catch(console.error);
  redisStore = new RedisStore({ client: redisClient });
  if (redisStore) console.log('RedisStore initialized');
  else console.log('RedisStore not initialized');
}

export default (app) => {
app.use(session({
    name:'sessionId',
    secret: dotenv.SECRET,
    resave: false,
    saveUninitialized: false,
    store: redisStore || undefined,
    cookie: {
        secure: dotenv.NODE_ENV === 'production', // true in production (HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: dotenv.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));
};