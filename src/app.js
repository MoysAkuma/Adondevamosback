import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware';
import routes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handleError);

export default app;